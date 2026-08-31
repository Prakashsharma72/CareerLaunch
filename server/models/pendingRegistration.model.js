import { DataTypes } from "sequelize";
import db from "../config/db.js";

const PendingRegistration = db.define(
  "PendingRegistration",
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

    otp: {
      type:      DataTypes.STRING(6),
      allowNull: true,
    },

    otpExpiresAt: {
      type:      DataTypes.DATE,
      allowNull: true,
      field:     "otp_expires_at",
    },
  },
  {
    tableName:  "pending_registrations",
    timestamps: true,
    createdAt:  "created_at",
    updatedAt:  "updated_at",
  }
);

export default PendingRegistration;
