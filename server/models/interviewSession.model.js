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
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     "user_id",
    },
    role: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type:         DataTypes.STRING,
      defaultValue: "active",
    },
    totalQuestions: {
      type:         DataTypes.INTEGER,
      defaultValue: 0,
      field:        "total_questions",
    },
    answeredQuestions: {
      type:         DataTypes.INTEGER,
      defaultValue: 0,
      field:        "answered_questions",
    },
    overallScore: {
      type:         DataTypes.FLOAT,
      defaultValue: 0,
      field:        "overall_score",
    },
    report: {
      type:         DataTypes.TEXT,
      defaultValue: null,
    },
    // The table uses started_at instead of created_at
    createdAt: {
      type:  DataTypes.DATE,
      field: "started_at",
    },
  },
  {
    tableName:  "interview_sessions",
    // Disable automatic timestamp management — the table has started_at (no updated_at)
    timestamps:  false,
    underscored: true,
  }
);

export default InterviewSession;
