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

import crypto                 from "crypto";
import User                   from "../models/user.model.js";
import PendingRegistration     from "../models/pendingRegistration.model.js";
import PasswordReset          from "../models/passwordReset.model.js";
import bcrypt                 from "bcryptjs";
import jwt                    from "jsonwebtoken";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

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

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
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
    const existingUser = await User.findOne({ where: { email: normalEmail } });
    const existingPending = await PendingRegistration.findOne({ where: { email: normalEmail } });

    if (existingUser) {
      return res.status(409).json({ code: "EMAIL_TAKEN", message: "An account with that email already exists." });
    }

    if (existingPending) {
      const otp          = generateOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      const hashed       = await bcrypt.hash(password, 12);

      await existingPending.update({ password: hashed, otp, otpExpiresAt });

      try {
        if (process.env.NODE_ENV === "development") {
          log(`Sending OTP for pending registration`, { email: normalEmail, otp });
        }
        await sendOtpEmail(normalEmail, otp, name.trim());
      } catch (mailErr) {
        errLog("Failed to resend OTP (pending registration)", mailErr);
        return res.status(500).json({ code: "EMAIL_ERROR", message: "Could not send verification email. Please try again." });
      }

      log(`✓ Refreshed OTP for pending registration: ${normalEmail}`);
      return res.status(200).json({
        message: "Verification code sent to your email.",
        email:   normalEmail,
        otpSent: true,
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
    };

    log("Creating pending registration…", { name: payload.name, email: payload.email });

    let created;
    try {
      created = await PendingRegistration.create(payload);
    } catch (insertErr) {
      errLog("INSERT INTO pending_registrations FAILED", { message: insertErr.message, original: insertErr.original?.message });
      throw insertErr;
    }

    log(`✓ Pending registration created — ID: ${created.id}`);

    /* ── Send OTP email ── */
    try {
      if (process.env.NODE_ENV === "development") {
        log(`Sending OTP for new registration`, { email: normalEmail, otp });
      }
      await sendOtpEmail(normalEmail, otp, name.trim());
      log(`✓ OTP sent to: ${normalEmail}`);
    } catch (mailErr) {
      // Roll back: delete the pending registration so the user can retry cleanly
      await created.destroy();
      errLog("OTP email failed — pending registration rolled back", mailErr);
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
  if (!otp?.toString().trim()) return res.status(400).json({ code: "VALIDATION_ERROR", message: "otp is required" });

  const normalEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().replace(/\D/g, "").trim();

  if (cleanOtp.length !== 6) return res.status(400).json({ code: "VALIDATION_ERROR", message: "otp must be a 6-digit code" });

  try {
    const pending = await PendingRegistration.findOne({ where: { email: normalEmail } });

    if (!pending) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No pending verification found for that email." });
    }

    if (!pending.otp || !pending.otpExpiresAt) {
      return res.status(400).json({ code: "NO_OTP", message: "No OTP found. Please request a new code." });
    }

    if (new Date() > new Date(pending.otpExpiresAt)) {
      return res.status(400).json({ code: "OTP_EXPIRED", message: "Verification code has expired. Please request a new one." });
    }

    if (pending.otp !== cleanOtp) {
      return res.status(400).json({ code: "INVALID_OTP", message: "Invalid verification code. Please try again." });
    }

    /* ── Create permanent user and delete pending registration ── */
    const userPayload = {
      name:       pending.name,
      email:      pending.email,
      password:   pending.password,
      role:       pending.role,
      phone:      pending.phone,
      education:  pending.education,
      skills:     pending.skills,
      isVerified: true,
    };

    const user = await User.create(userPayload);
    await pending.destroy();

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
    const pending = await PendingRegistration.findOne({ where: { email: normalEmail } });

    if (!pending) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No pending verification found for that email." });
    }

    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pending.update({ otp, otpExpiresAt });

    try {
      if (process.env.NODE_ENV === "development") {
        log(`Resending OTP for pending verification`, { email: normalEmail, otp });
      }
      await sendOtpEmail(normalEmail, otp, pending.name);
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
   FORGOT PASSWORD   POST /api/auth/forgot-password
   Sends a one-time reset link to the user's email.
───────────────────────────────────────────────────────────────────────── */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ where: { email: normalEmail } });

    if (!user) {
      log("Forgot password requested for unknown email", { email: normalEmail });
      return res.status(200).json({
        message: "If your email exists, you will receive password reset instructions.",
      });
    }

    const token     = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordReset.upsert({ email: normalEmail, token, expiresAt });

    try {
      await sendPasswordResetEmail(normalEmail, token, user.name);
      log(`✓ Password reset email sent: ${normalEmail}`);
    } catch (mailErr) {
      errLog("forgotPassword() email failed", mailErr);
      return res.status(500).json({ code: "EMAIL_ERROR", message: "Could not send password reset email. Please try again." });
    }

    return res.status(200).json({
      message: "If your email exists, you will receive password reset instructions.",
    });
  } catch (e) {
    errLog("forgotPassword() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Password reset request failed." });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   RESET PASSWORD   POST /api/auth/reset-password
   Validates the reset token, updates the password, and clears the token.
───────────────────────────────────────────────────────────────────────── */
export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  }
  if (!token?.trim()) {
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "token is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "password must be at least 6 characters" });
  }

  const normalEmail = email.toLowerCase().trim();
  const cleanToken  = token.trim();

  try {
    const resetEntry = await PasswordReset.findOne({ where: { email: normalEmail, token: cleanToken } });

    if (!resetEntry) {
      return res.status(400).json({ code: "INVALID_TOKEN", message: "Invalid or expired reset token." });
    }

    if (new Date() > new Date(resetEntry.expiresAt)) {
      await resetEntry.destroy();
      return res.status(400).json({ code: "TOKEN_EXPIRED", message: "Password reset token has expired. Please request a new one." });
    }

    const user = await User.findOne({ where: { email: normalEmail } });
    if (!user) {
      return res.status(404).json({ code: "NOT_FOUND", message: "No account found with that email." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await user.update({ password: hashedPassword });
    await resetEntry.destroy();

    log(`✓ Password reset completed for user ${user.id}`);

    return res.status(200).json({
      message: "Your password has been reset successfully. You may now sign in with your new password.",
    });
  } catch (e) {
    errLog("resetPassword() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Password reset failed." });
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
