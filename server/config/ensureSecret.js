/**
 * ensureSecret.js
 *
 * Called once at server startup (before any other import).
 * Guarantees that process.env.JWT_SECRET is a cryptographically
 * strong secret of at least 32 bytes.
 *
 * If the current value is missing, empty, or a known weak placeholder
 * the module:
 *   1. Generates a fresh 64-byte (128 hex chars) random secret.
 *   2. Writes / updates the JWT_SECRET line in server/.env so the
 *      new value survives restarts.
 *   3. Sets process.env.JWT_SECRET so the running process uses it
 *      immediately without needing a restart.
 *
 * The function is synchronous so it finishes before any async import
 * chain can accidentally call jwt.sign() with an undefined secret.
 */

import crypto from "crypto";
import fs     from "fs";
import path   from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH  = path.resolve(__dirname, "../.env");

/* Secrets that are considered weak / placeholder values */
const WEAK_SECRETS = new Set([
  "",
  "secret",
  "jwt_secret",
  "super_secret_key",
  "your_jwt_secret",
  "changeme",
  "replace_me",
]);

function isWeakSecret(value) {
  if (!value || typeof value !== "string") return true;
  const v = value.trim().toLowerCase();
  if (WEAK_SECRETS.has(v)) return true;
  // Anything shorter than 32 chars is too short regardless
  if (value.trim().length < 32) return true;
  return false;
}

function generateSecret() {
  return crypto.randomBytes(64).toString("hex"); // 128 hex chars
}

/**
 * Read the current .env text, replace (or append) the JWT_SECRET line,
 * and write the file back.  Never touches any other key.
 */
function persistSecret(secret) {
  let content = "";
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
  }

  const line    = `JWT_SECRET=${secret}`;
  const pattern = /^JWT_SECRET=.*$/m;

  if (pattern.test(content)) {
    content = content.replace(pattern, line);
  } else {
    // Append with a leading newline if the file doesn't end with one
    content = content.endsWith("\n") ? content + line + "\n"
                                     : content + "\n" + line + "\n";
  }

  fs.writeFileSync(ENV_PATH, content, "utf8");
}

/**
 * Main export — call at the very top of server.js before any other code.
 * Returns the secret that is now in process.env.JWT_SECRET.
 */
export function ensureJwtSecret() {
  const current = process.env.JWT_SECRET;

  if (!isWeakSecret(current)) {
    // Already strong — nothing to do
    return current;
  }

  const wasWeak = !!current; // true = existed but weak; false = missing entirely
  const secret  = generateSecret();

  // Apply to the running process immediately
  process.env.JWT_SECRET = secret;

  // Persist to .env so the next restart also gets a strong secret
  try {
    persistSecret(secret);
    console.log(
      wasWeak
        ? `⚠️  [ensureSecret] Replaced weak JWT_SECRET with a 64-byte generated secret (written to .env)`
        : `⚠️  [ensureSecret] JWT_SECRET was missing — generated a 64-byte secret (written to .env)`
    );
  } catch (e) {
    // .env write failing is non-fatal; the in-memory value is correct.
    // On the next restart the secret will differ — warn loudly.
    console.warn(
      `⚠️  [ensureSecret] Could not write new JWT_SECRET to .env: ${e.message}` +
      `\n   The secret is set for THIS process only. Persist it manually.`
    );
  }

  return secret;
}
