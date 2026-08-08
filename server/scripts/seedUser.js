/**
 * seedUser.js
 * Upserts the user — creates if missing, updates password+name+role if exists.
 * Run: node scripts/seedUser.js
 */
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";
import User from "../models/user.model.js";

const EMAIL    = "prakash123@gmail.com";
const PASSWORD = "Prakash@123";
const NAME     = "Prakash Sharma";
const ROLE     = "student";           // change to "admin" if needed

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
    await User.sync();

    const hashed   = await bcrypt.hash(PASSWORD, 10);
    const existing = await User.findOne({ where: { email: EMAIL } });

    if (existing) {
      await existing.update({ name: NAME, password: hashed, role: ROLE });
      console.log(`✅ User updated  → id=${existing.id}  email=${EMAIL}  role=${ROLE}`);
    } else {
      const user = await User.create({ name: NAME, email: EMAIL, password: hashed, role: ROLE });
      console.log(`✅ User created  → id=${user.id}  email=${EMAIL}  role=${ROLE}`);
    }
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
