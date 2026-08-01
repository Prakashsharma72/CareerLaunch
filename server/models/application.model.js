import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Application = db.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "job_id",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Applied",
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "applied_at",
    },
  },
  {
    tableName: "applications",
    timestamps: false,
  }
);

export default Application;
