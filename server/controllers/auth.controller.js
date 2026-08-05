/**
 * auth.controller.js
 *
 * POST /api/auth/register  — create account, return JWT + safe user
 * POST /api/auth/login     — verify credentials, return JWT + safe user
 *
 * JWT payload includes: { id, name, email, role }
 * Token expiry: 7 days
 *
 * Passwords: hashed with bcrypt (cost 12) — plain text never stored.
 * All data is read from / written to MySQL only — no mock users.
 */
import User   from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";

const TAG = "[auth]";
const log = (msg, data) =>
  console.log(
    `${new Date().toISOString()} ${TAG} ${msg}`,
    data !== undefined ? JSON.stringify(data) : ""
  );
const errLog = (msg, e) =>
  console.error(`${new Date().toISOString()} ${TAG} ❌ ${msg}`, e?.message ?? e);

/* Safe projection — password hash is NEVER returned to the client */
const SAFE_ATTRS = { exclude: ["password"] };

/**
 * Build a signed JWT containing the user's id, name, email and role.
 * Throws if JWT_SECRET is not set (caught by the callers below).
 */
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured — cannot issue token");
  }
  return jwt.sign(
    {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    secret,
    { expiresIn: "7d" }
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   REGISTER   POST /api/auth/register
───────────────────────────────────────────────────────────────────────── */
export const register = async (req, res) => {
  log("Register request", { ...req.body, password: "***" });

  const { name, email, password, phone, education, skills, role } = req.body;

  /* ── Input validation ────────────────────────────────────────────────── */
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
    /* ── Duplicate-email check ───────────────────────────────────────────── */
    log(`Checking for existing account: ${normalEmail}`);
    const existing = await User.findOne({ where: { email: normalEmail } });
    if (existing) {
      log(`Duplicate email rejected: ${normalEmail}`);
      return res.status(409).json({
        code:    "EMAIL_TAKEN",
        message: "An account with that email already exists.",
      });
    }

    /* ── Hash password (cost 12) ─────────────────────────────────────────── */
    log("Hashing password…");
    const hashed = await bcrypt.hash(password, 12);

    /* ── Insert into MySQL ───────────────────────────────────────────────── */
    const payload = {
      name:      name.trim(),
      email:     normalEmail,
      password:  hashed,           // ← bcrypt hash only, never plain text
      role:      role === "admin" ? "admin" : "student",
      phone:     phone      || null,
      education: education  || null,
      skills:    skills     || null,
    };

    log("Inserting user…", { name: payload.name, email: payload.email, role: payload.role });

    let created;
    try {
      created = await User.create(payload);
    } catch (insertErr) {
      errLog("INSERT INTO users FAILED", {
        message:  insertErr.message,
        sql:      insertErr.sql,
        original: insertErr.original?.message,
      });
      throw insertErr;
    }

    log(`✓ User created — ID: ${created.id}`);

    /* ── Build response ──────────────────────────────────────────────────── */
    const user  = await User.findByPk(created.id, { attributes: SAFE_ATTRS });
    const token = signToken(user);

    log(`✓ JWT issued — user ${user.id} role=${user.role}`);

    return res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });

  } catch (e) {
    errLog("register() unhandled error", e);

    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ code: "EMAIL_TAKEN", message: "An account with that email already exists." });
    }
    if (e.name === "SequelizeValidationError") {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: e.errors.map(v => v.message).join("; ") });
    }
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Registration failed." });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   LOGIN   POST /api/auth/login
───────────────────────────────────────────────────────────────────────── */
export const login = async (req, res) => {
  log("Login request", { email: req.body.email });

  const { email, password } = req.body;

  /* ── Input validation ────────────────────────────────────────────────── */
  if (!email?.trim())
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "email is required" });
  if (!password)
    return res.status(400).json({ code: "VALIDATION_ERROR", message: "password is required" });

  const normalEmail = email.toLowerCase().trim();

  try {
    /* ── Find user (include password for comparison) ─────────────────────── */
    log(`Looking up: ${normalEmail}`);
    const userWithPw = await User.findOne({ where: { email: normalEmail } });

    if (!userWithPw) {
      log(`No account found: ${normalEmail}`);
      return res.status(404).json({ code: "NOT_FOUND", message: "No account found with that email." });
    }

    /* ── Verify password against bcrypt hash ─────────────────────────────── */
    const match = await bcrypt.compare(password, userWithPw.password);
    if (!match) {
      log(`Incorrect password for: ${normalEmail}`);
      return res.status(401).json({ code: "WRONG_PASSWORD", message: "Incorrect password." });
    }

    /* ── Build response ──────────────────────────────────────────────────── */
    const user  = await User.findByPk(userWithPw.id, { attributes: SAFE_ATTRS });
    const token = signToken(user);

    log(`✓ Login successful — user ${user.id} role=${user.role}`);

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });

  } catch (e) {
    errLog("login() unhandled error", e);
    return res.status(500).json({ code: "SERVER_ERROR", message: e.message || "Login failed." });
  }
};
