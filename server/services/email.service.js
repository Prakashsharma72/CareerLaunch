/**
 * email.service.js
 *
 * Thin wrapper around nodemailer.
 * Uses SMTP credentials from environment variables (see server/.env).
 *
 * Exported helpers:
 *   sendOtpEmail(to, otp)  — sends a 6-digit OTP verification email
 */

import nodemailer from "nodemailer";

const TAG = "[email]";

/* ── Transporter ────────────────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false otherwise
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP verification email.
 * @param {string} to   — recipient email
 * @param {string} otp  — 6-digit OTP code
 * @param {string} name — recipient display name
 */
export async function sendOtpEmail(to, otp, name = "there") {
  const fromName    = process.env.SMTP_FROM_NAME  || "CareerLaunch AI";
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from:    `"${fromName}" <${fromAddress}>`,
    to,
    subject: "Verify your CareerLaunch AI account",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0062c3 0%,#0ba5ff 50%,#8b5cf6 100%);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                          letter-spacing:-0.5px;">
                🚀 CareerLaunch AI
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Your career, powered by AI.
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;font-weight:600;">
                Hi ${name} 👋
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                Thanks for signing up! Use the verification code below to confirm
                your email address. This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f0f6ff;border:2px dashed #0ba5ff;
                                border-radius:12px;padding:20px 48px;">
                      <span style="font-size:38px;font-weight:800;letter-spacing:10px;
                                   color:#0062c3;font-family:monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
                If you didn't create an account with CareerLaunch AI, you can safely
                ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #eee;
                        text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaa;">
                © ${new Date().getFullYear()} CareerLaunch AI · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi ${name},\n\nYour CareerLaunch AI verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't sign up, ignore this email.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`${TAG} OTP email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`${TAG} Failed to send OTP email to ${to}:`, err.message);
    throw err;
  }
}
