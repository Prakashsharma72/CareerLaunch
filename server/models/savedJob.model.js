/**
 * SavedJob model — stores bookmark data inline.
 * NO foreign key to jobs table. Live job data is stored at save time.
 */
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const SavedJob = db.define(
  "SavedJob",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.INTEGER, allowNull: false, field: "user_id",
    },

    // Keep job_id for legacy rows — now optional
    jobId: {
      type: DataTypes.INTEGER, allowNull: true, field: "job_id",
    },

    // ── Inline job data saved at bookmark time ──────────────────
    externalJobId: { type: DataTypes.STRING(255), allowNull: true, field: "external_job_id" },
    source:        { type: DataTypes.STRING(100), allowNull: true },
    title:         { type: DataTypes.STRING(255), allowNull: true },
    company:       { type: DataTypes.STRING(255), allowNull: true },
    companyLogo:   { type: DataTypes.TEXT,        allowNull: true, field: "company_logo" },
    location:      { type: DataTypes.STRING(255), allowNull: true },
    salary:        { type: DataTypes.STRING(255), allowNull: true },
    employmentType:{ type: DataTypes.STRING(100), allowNull: true, field: "employment_type" },
    applyUrl:      { type: DataTypes.TEXT,        allowNull: true, field: "apply_url" },
    postedDate:    { type: DataTypes.STRING(50),  allowNull: true, field: "posted_date" },

    savedAt: {
      type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "saved_at",
    },
  },
  {
    tableName:  "saved_jobs",
    timestamps: false,
    indexes: [{ unique: true, fields: ["user_id", "external_job_id"] }],
  }
);

export default SavedJob;
