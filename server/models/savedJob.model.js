import { DataTypes } from "sequelize";
import db from "../config/db.js";

const SavedJob = db.define(
  "SavedJob",
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
    savedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "saved_at",
    },
  },
  {
    tableName: "saved_jobs",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "job_id"],
      },
    ],
  }
);

export default SavedJob;
