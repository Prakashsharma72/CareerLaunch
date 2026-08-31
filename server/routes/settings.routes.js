/**
 * settings.routes.js
 *
 * GET  /api/settings/keys  — return current key values (masked)
 * PUT  /api/settings/keys  — overwrite OPENAI_API_KEY / GOOGLE_MAPS_API_KEY in .env
 *
 * Both endpoints are admin-only.
 */
import express  from "express";
import fs       from "fs";
import path     from "path";
import { fileURLToPath } from "url";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ── resolve .env path relative to this file (server/.env) ── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH  = path.resolve(__dirname, "../.env");

/* ── helpers ── */

/** Read .env into a key→value map */
function readEnv() {
  const raw  = fs.readFileSync(ENV_PATH, "utf8");
  const map  = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    map[key]  = val;
  }
  return map;
}

/** Rewrite a single key in the .env file without touching anything else */
function updateEnvKey(key, value) {
  let raw     = fs.readFileSync(ENV_PATH, "utf8");
  const regex = new RegExp(`^(${key}\\s*=).*$`, "m");

  if (regex.test(raw)) {
    raw = raw.replace(regex, `$1${value}`);
  } else {
    // key doesn't exist yet — append it
    raw += `\n${key}=${value}\n`;
  }
  fs.writeFileSync(ENV_PATH, raw, "utf8");
}

/** Mask a key: show first 6 and last 4 chars, rest as *** */
function mask(val) {
  if (!val || val.length <= 10) return val ? "***" : "";
  return val.slice(0, 6) + "***" + val.slice(-4);
}

/* ── GET /api/settings/keys ── */
router.get(
  "/keys",
  verifyToken,
  requireRole("admin"),
  (_req, res) => {
    try {
      const env = readEnv();
      res.json({
        OPENAI_API_KEY:       { masked: mask(env.OPENAI_API_KEY),       set: !!env.OPENAI_API_KEY       },
        GOOGLE_MAPS_API_KEY:  { masked: mask(env.GOOGLE_MAPS_API_KEY),  set: !!env.GOOGLE_MAPS_API_KEY  },
      });
    } catch (err) {
      console.error("[settings] GET error:", err.message);
      res.status(500).json({ message: "Could not read settings." });
    }
  }
);

/* ── PUT /api/settings/keys ── */
router.put(
  "/keys",
  verifyToken,
  requireRole("admin"),
  (req, res) => {
    try {
      const { OPENAI_API_KEY, GOOGLE_MAPS_API_KEY } = req.body;

      if (!OPENAI_API_KEY && !GOOGLE_MAPS_API_KEY) {
        return res.status(400).json({ message: "No keys provided." });
      }

      if (OPENAI_API_KEY      && typeof OPENAI_API_KEY      === "string") {
        updateEnvKey("OPENAI_API_KEY",      OPENAI_API_KEY.trim());
        process.env.OPENAI_API_KEY      = OPENAI_API_KEY.trim();
      }
      if (GOOGLE_MAPS_API_KEY && typeof GOOGLE_MAPS_API_KEY === "string") {
        updateEnvKey("GOOGLE_MAPS_API_KEY", GOOGLE_MAPS_API_KEY.trim());
        process.env.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY.trim();
      }

      console.log("[settings] API keys updated by admin");
      res.json({ message: "API keys updated successfully." });
    } catch (err) {
      console.error("[settings] PUT error:", err.message);
      res.status(500).json({ message: "Could not save settings." });
    }
  }
);

export default router;
