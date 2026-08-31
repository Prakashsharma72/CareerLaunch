import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

// Ensure we load the server/.env file even when running this script from repo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const smtpConfig = {
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
};

const t = nodemailer.createTransport(smtpConfig);

console.log("Testing SMTP config:", { host: smtpConfig.host, port: smtpConfig.port, user: smtpConfig.auth.user, secure: smtpConfig.secure });

console.log("Testing SMTP config:");
console.log("  host:", process.env.SMTP_HOST);
console.log("  port:", process.env.SMTP_PORT);
console.log("  user:", process.env.SMTP_USER);

try {
  await t.verify();
  console.log("\n✓ SMTP connection OK — credentials are valid.");
} catch (e) {
  console.error("\n✗ SMTP ERROR:", e.message);
  console.error("  code:", e.code);
  console.error("  errno:", e.errno);
  console.error("  syscall:", e.syscall);
  console.error("  responseCode:", e.responseCode);
  console.error("  response:", e.response);
  console.error("  stack:", e.stack);
}
process.exit(0);
