/**
 * auth.controller.js
 *
 * POST /api/auth/register     — validate + create unverified user, send OTP
 * POST /api/auth/verify-otp   — check OTP, mark verified, return JWT
 * POST /api/auth/resend-otp   — generate new OTP and resend
 * POST /api/auth/login        — verify credentials, return JWT + safe user
 *
 * OTP: 6-digit numeric, expires after 10 minutes.
 * JWT payload: { id, name, email, role }  — expires in 7 days.
 * Passwords: hashed with bcrypt (cost 12) — plain text never stored.
 */

import User           from "../models/user.model.js";
import bcrypt         from "bcryptjs";
import jwt            from "jsonwebtoken";
import { sendOtpEmail } from "../services/email.service.js";

const TAG    = "[auth]";
const log    = (msg, data) =>
  console.log(`${new Date().toISOString()} ${TAG} ${msg}`, data !== undefined ? JSON.stringify(data) : "");
const errLog = (msg, e) =>
  console.error(`${new Date().toISOString()} ${TAG} ❌ ${msg}`, e?.message ?? e);

/* Safe projection — password hash / OTP never returned to the client */
const SAFE_ATTRS = { exclude: ["password", "otp", "otpExpiresAt"] };

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured — cannot issue token");
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

/* ─────────────────────────────────────────────────────────────────────────
   REGISTER   POST /api/auth/register
   Creates the user (unverified) and sends OTP to email.
   Does NOT return a JWT — client must call /verify-otp first.
───────────────────────────────────────────────────────────────────────── */
export const register = async (req, res) => {
  log("Register request", { ...req.body, password: "***" });

  const { name, email, password, phone, education, skills, role } = req.body;

  /* ── Input validation ── */
  if (!name?.trim())
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "name is required" });
  if (!email?.trim())
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  if (!password)
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "password is required" });
  if (password.length < 6)
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "password must be at least 6 characters" });

  const normalEmail = email.toLowerCase().trim();

  try {
    /* ── Check for existing verified account ── */
    const existing = await User.findOne({ where: { email: normalEmail } });

    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ code: "EMAIL_TAKEN", message: "An account with that email already exists." });
      }

      // Account exists but is unverified — resend a fresh OTP instead of duplicating
      const otp           = generateOtp();
      const otpExpiresAt  = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      const hashed        = await bcrypt.hash(password, 12);

      await existing.update({ password: hashed, otp, otpExpiresAt });

      try {
        await sendOtpEmail(normalEmail, otp, existing.name);
      } catch (mailErr) {
        errLog("Failed to resend OTP (unverified account)", mailErr);
        return res.status(500).json({ code: "EMAIL_ERROR", message: "Could not send verification email. Please try again." });
      }

      log(`✓ Refreshed OTP for unverified account: ${normalEmail}`);
      return res.status(200).json({
        message:   "Verification code sent to your email.",
        email:     normalEmail,
        otpSent:   true,
      });
    }

    /* ── Hash password ── */
    const hashed = await bcrypt.hash(password, 12);

    /* ── Generate OTP ── */
    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    /* ── Create user (unverified) ── */
    const payload = {
      name:         name.trim(),
      email:        normalEmail,
      password:     hashed,
      role:         role === "admin" ? "admin" : "student",
      phone:        phone     || null,
      education:    education || null,
      skills:       skills    || null,
      otp,
      otpExpiresAt,
      isVerified:   false,
    };

    log("Creating unverified user…", { name: payload.name, email: payload.email });

    let created;
    try {
      created = await User.create(payload);
    } catch (insertErr) {
      errLog("INSERT INTO users FAILED", { message: insertErr.message, original: insertErr.original?.message });
      throw insertErr;
    }

    log(`✓ Unverified user created — ID: ${created.id}`);

    /* ── Send OTP email ── */
    try {
      await sendOtpEmail(normalEmail, otp, name.trim());
      log(`✓ OTP sent to: ${normalEmail}`);
    } catch (mailErr) {
      // Roll back: delete the user row so they can retry cleanly
      await created.destroy();
      errLog("OTP email failed — user rolled back", mailErr);
      return res.status(500).json({
        code:    "EMAIL_ERROR",
        message: "Could not send verification email. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Verification code sent to your email.",
      email:   normalEmail,
      otpSent: true,
    });

  } catch (e) {
    errLog("register() unhandled error", e);
    if (e.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ code: "EMAIL_TAKEN", message: "An account with that email already exists." });
    if (e.name === "SequelizeValidationError")
      return res.status(400).json({ code: "VALIDATION_ERROR", message: e.errors.map(v => v.message).join("; ") });
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Registration failed." });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   VERIFY OTP   POST /api/auth/verify-otp
   Validates the OTP, marks user as verified, returns JWT.
───────────────────────────────────────────────────────────────────────── */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email?.trim()) return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  if (!otp?.trim())   return res.status(400).json({ code: "VALIDATION_ERROR", message: "otp is required" });

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ where: { email: normalEmail } });

    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No account found with that email." });
    }

    if (user.isVerified) {
      return res.status(400).json({ code: "ALREADY_VERIFIED", message: "This account is already verified. Please log in." });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ code: "NO_OTP", message: "No OTP found. Please request a new code." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ code: "OTP_EXPIRED", message: "Verification code has expired. Please request a new one." });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ code: "INVALID_OTP", message: "Invalid verification code. Please try again." });
    }

    /* ── Mark verified, clear OTP fields ── */
    await user.update({ isVerified: true, otp: null, otpExpiresAt: null });

    const safeUser = await User.findByPk(user.id, { attributes: SAFE_ATTRS });
    const token    = signToken(safeUser);

    log(`✓ Email verified — user ${user.id}`);

    return res.status(200).json({
      message: "Email verified successfully. Welcome to CareerLaunch AI!",
      user:    safeUser,
      token,
    });

  } catch (e) {
    errLog("verifyOtp() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Verification failed." });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   RESEND OTP   POST /api/auth/resend-otp
   Generates a fresh OTP and resends it.
───────────────────────────────────────────────────────────────────────── */
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ where: { email: normalEmail } });

    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No account found with that email." });
    }

    if (user.isVerified) {
      return res.status(400).json({ code: "ALREADY_VERIFIED", message: "This account is already verified." });
    }

    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otpExpiresAt });

    try {
      await sendOtpEmail(normalEmail, otp, user.name);
      log(`✓ OTP resent to: ${normalEmail}`);
    } catch (mailErr) {
      errLog("resendOtp() email failed", mailErr);
      return res.status(500).json({ code: "EMAIL_ERROR", message: "Could not send verification email. Please try again." });
    }

    return res.status(200).json({ message: "A new verification code has been sent to your email." });

  } catch (e) {
    errLog("resendOtp() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Failed to resend OTP." });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   LOGIN   POST /api/auth/login
───────────────────────────────────────────────────────────────────────── */
export const login = async (req, res) => {
  log("Login request", { email: req.body.email });

  const { email, password } = req.body;

  if (!email?.trim())
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  if (!password)
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "password is required" });

  const normalEmail = email.toLowerCase().trim();

  try {
    const userWithPw = await User.findOne({ where: { email: normalEmail } });

    if (!userWithPw) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No account found with that email." });
    }

    /* ── Block unverified accounts from logging in ── */
    if (!userWithPw.isVerified) {
      return res.status(403).json({
        code:    "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
        email:   normalEmail,
      });
    }

    const match = await bcrypt.compare(password, userWithPw.password);
    if (!match) {
      return res.status(401).json({ code: "WRONG_PASSWORD", message: "Incorrect password." });
    }

    const user  = await User.findByPk(userWithPw.id, { attributes: SAFE_ATTRS });
    const token = signToken(user);

    log(`✓ Login successful — user ${user.id} role=${user.role}`);

    return res.status(200).json({ message: "Login successful", user, token });

  } catch (e) {
    errLog("login() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Login failed." });
  }
};
