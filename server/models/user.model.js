/**
 * user.model.js
 *
 * Matches the EXACT MySQL `users` table schema:
 *   id, name, email, password, role, phone,
 *   education, skills, resume_url, profile_image, created_at,
 *   otp, otp_expires_at, is_verified
 *
 * timestamps: false  — table has created_at but NO updatedAt column.
 * createdAt is mapped to the `created_at` column via the field option.
 */
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define(
  "User",
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },

    name: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },

    email: {
      type:      DataTypes.STRING(255),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },

    password: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type:         DataTypes.STRING(50),
      allowNull:    false,
      defaultValue: "student",
    },

    phone: {
      type:      DataTypes.STRING(20),
      allowNull: true,
    },

    education: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },

    skills: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },

    resumeUrl: {
      type:      DataTypes.TEXT,
      allowNull: true,
      field:     "resume_url",
    },

    profileImage: {
      type:      DataTypes.TEXT,
      allowNull: true,
      field:     "profile_image",
    },

    // Map JS createdAt → DB created_at
    createdAt: {
      type:  DataTypes.DATE,
      field: "created_at",
    },

    // ── OTP email verification ────────────────────────────────────────────
    otp: {
      type:      DataTypes.STRING(6),
      allowNull: true,
    },

    otpExpiresAt: {
      type:      DataTypes.DATE,
      allowNull: true,
      field:     "otp_expires_at",
    },

    isVerified: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
      field:        "is_verified",
    },
  },
  {
    tableName:  "users",
    timestamps: true,
    updatedAt:  false,        // no updated_at column in MySQL table
    createdAt:  "created_at", // tell Sequelize which column to write
  }
);

export default User;
