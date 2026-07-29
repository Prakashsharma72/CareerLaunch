import { DataTypes } from "sequelize";
import db from "../config/db.js";

const InterviewSession = db.define(
  "InterviewSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      // "active" | "completed"
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    answeredQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    overallScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    // Full AI-generated final report stored as JSON text
    report: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  {
    tableName: "interview_sessions",
    timestamps: true,
  }
);

export default InterviewSession;
