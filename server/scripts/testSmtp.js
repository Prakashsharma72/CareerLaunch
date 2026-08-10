import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const t = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

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
  console.error("  responseCode:", e.responseCode);
  console.error("  response:", e.response);
}
process.exit(0);
