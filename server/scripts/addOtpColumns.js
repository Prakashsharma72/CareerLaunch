import sequelize from "../config/db.js";

const sql = `
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS otp VARCHAR(6) NULL,
    ADD COLUMN IF NOT EXISTS otp_expires_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0
`;

try {
  await sequelize.query(sql);
  console.log("✓ OTP columns added to users table.");
} catch (e) {
  console.error("Migration failed:", e.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
