import { DataTypes } from "sequelize";
import db from "../config/db.js";

const InterviewQuestion = db.define(
  "InterviewQuestion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      // "technical" | "behavioral" | "conceptual"
      type: DataTypes.STRING,
      defaultValue: "technical",
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userAnswer: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    // Full AI feedback object stored as JSON text
    feedback: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    score: {
      // 1–10
      type: DataTypes.FLOAT,
      defaultValue: null,
    },
    skipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "interview_questions",
    timestamps: true,
  }
);

export default InterviewQuestion;
