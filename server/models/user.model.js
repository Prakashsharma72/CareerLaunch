import { DataTypes } from "sequelize";
import db from "../config/db.js";

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "student",
    },

    // ── Contact ──────────────────────────────────────────────
    phone:    { type: DataTypes.STRING(20),  allowNull: true },
    location: { type: DataTypes.STRING(255), allowNull: true },

    // ── Profile ───────────────────────────────────────────────
    bio:          { type: DataTypes.TEXT,        allowNull: true },
    profileImage: { type: DataTypes.TEXT,        allowNull: true, field: "profile_image" },
    dob:          { type: DataTypes.DATEONLY,    allowNull: true },
    gender:       { type: DataTypes.STRING(50),  allowNull: true },

    // ── Education ─────────────────────────────────────────────
    college:   { type: DataTypes.STRING(255), allowNull: true },
    degree:    { type: DataTypes.STRING(100), allowNull: true },
    branch:    { type: DataTypes.STRING(100), allowNull: true },
    gradYear:  { type: DataTypes.STRING(10),  allowNull: true, field: "grad_year" },
    education: { type: DataTypes.TEXT,        allowNull: true },   // free-text summary

    // ── Career ────────────────────────────────────────────────
    skills:     { type: DataTypes.TEXT, allowNull: true },         // comma-separated
    experience: { type: DataTypes.TEXT, allowNull: true },
    languages:  { type: DataTypes.STRING(255), allowNull: true },

    // ── Links ─────────────────────────────────────────────────
    resumeUrl: { type: DataTypes.TEXT,        allowNull: true, field: "resume_url"  },
    github:    { type: DataTypes.STRING(255), allowNull: true },
    linkedin:  { type: DataTypes.STRING(255), allowNull: true },
    portfolio: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
