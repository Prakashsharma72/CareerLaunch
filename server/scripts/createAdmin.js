/**
 * createAdmin.js
 * 
 * Script to create the default admin user in the database.
 * Run with: node scripts/createAdmin.js
 */

import bcrypt from "bcryptjs";
import "../config/dotenv.js";
import db from "../config/db.js";
import User from "../models/user.model.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@careerlaunch.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = "Admin User";

async function createAdmin() {
  try {
    console.log("🔌 Connecting to database...");
    await db.authenticate();
    console.log("✓ Database connected");

    // Check if admin already exists
    console.log(`🔍 Checking for existing admin: ${ADMIN_EMAIL}`);
    const existingAdmin = await User.findOne({ 
      where: { email: ADMIN_EMAIL } 
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Hash the password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create admin user
    console.log("👤 Creating admin user...");
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      phone: null,
      education: null,
      skills: null,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   ID:       ${admin.id}`);
    console.log(`   Name:     ${admin.name}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${admin.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();
