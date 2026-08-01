import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ResumeAnalysis = db.define(
  "ResumeAnalysis",
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
    atsScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "ats_score",
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resumeUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "resume_url",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "resume_analyses",
    timestamps: false,
  }
);

export default ResumeAnalysis;
