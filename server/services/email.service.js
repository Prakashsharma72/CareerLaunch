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
const smtpConfig = {
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false otherwise
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export async function verifySmtpConnection() {
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    throw new Error("SMTP configuration incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
  }

  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error(`${TAG} SMTP verification failed:`, err.message);
    console.error(`${TAG} SMTP verify error details:`, err);
    throw err;
  }
}

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
    console.log(`${TAG} Sending OTP email to ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`${TAG} OTP email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`${TAG} Failed to send OTP email to ${to}:`, err.message);
    console.error(`${TAG} SMTP error details:`, err);
    throw err;
  }
}

/**
 * Send password reset email.
 * @param {string} to   — recipient email
 * @param {string} token — reset token
 * @param {string} name  — recipient display name
 */
export async function sendPasswordResetEmail(to, token, name = "there") {
  const fromName    = process.env.SMTP_FROM_NAME  || "CareerLaunch AI";
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl    = `${frontendUrl.replace(/\/$/, "")}/reset-password?email=${encodeURIComponent(to)}&token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from:    `"${fromName}" <${fromAddress}>`,
    to,
    subject: "Reset your CareerLaunch AI password",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0062c3 0%,#0ba5ff 50%,#8b5cf6 100%);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                          letter-spacing:-0.5px;">
                🚀 CareerLaunch AI
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Reset your password securely.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1a1a2e;font-weight:600;">
                Hi ${name} 👋
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                We received a request to reset your CareerLaunch AI password.
                Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank"
                       style="display:inline-block;padding:16px 28px;border-radius:10px;
                              background:#0ba5ff;color:#ffffff;text-decoration:none;
                              font-size:15px;font-weight:700;">Reset password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
                If the button doesn't work, copy and paste the link below into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#888;word-break:break-all;">
                ${resetUrl}
              </p>
              <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
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
    text: `Hi ${name},\n\nWe received a request to reset your CareerLaunch AI password. Use the link below to choose a new password (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request a password reset, ignore this email.`,
  };

  try {
    console.log(`${TAG} Sending password reset email to ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`${TAG} Password reset email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`${TAG} Failed to send password reset email to ${to}:`, err.message);
    console.error(`${TAG} SMTP error details:`, err);
    throw err;
  }
}
