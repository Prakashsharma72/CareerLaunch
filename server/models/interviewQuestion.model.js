import { DataTypes } from "sequelize";
import db from "../config/db.js";

const InterviewQuestion = db.define(
  "InterviewQuestion",
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    sessionId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     "session_id",
    },
    questionNumber: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      field:     "question_number",
    },
    category: {
      type:         DataTypes.STRING,
      defaultValue: "technical",
    },
    question: {
      type:      DataTypes.TEXT,
      allowNull: false,
    },
    userAnswer: {
      type:         DataTypes.TEXT,
      defaultValue: null,
      field:        "user_answer",
    },
    feedback: {
      type:         DataTypes.TEXT,
      defaultValue: null,
    },
    score: {
      type:         DataTypes.FLOAT,
      defaultValue: null,
    },
    skipped: {
      type:         DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName:   "interview_questions",
    timestamps:  true,          // table has created_at + updated_at
    underscored: true,
  }
);

export default InterviewQuestion;
