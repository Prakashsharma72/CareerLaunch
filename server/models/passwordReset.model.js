import { DataTypes } from "sequelize";
import db from "../config/db.js";

const PasswordReset = db.define(
  "PasswordReset",
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },

    email: {
      type:      DataTypes.STRING(255),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },

    token: {
      type:      DataTypes.STRING(255),
      allowNull: false,
      unique:    true,
    },

    expiresAt: {
      type:      DataTypes.DATE,
      allowNull: false,
      field:     "expires_at",
    },
  },
  {
    tableName:  "password_resets",
    timestamps: true,
    createdAt:  "created_at",
    updatedAt:  "updated_at",
  }
);

export default PasswordReset;
