import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Job = db.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ── Identity ───────────────────────────────────────────────
    externalJobId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "external_job_id",
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "manual",
      field: "source",
    },
    googlePlaceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "google_place_id",
    },

    // ── Core fields ────────────────────────────────────────────
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    companyLogo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "company_logo",
    },
    website: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    careerPage: {
      type: DataTypes.STRING(512),
      allowNull: true,
      field: "career_page",
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // ── Job details ────────────────────────────────────────────
    employmentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "employment_type",
    },
    // legacy alias kept for backward compat — maps to same DB column
    type: {
      type: DataTypes.VIRTUAL,
      get() { return this.getDataValue("employmentType"); },
    },
    experienceLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Fresher",
      field: "experience_level",
    },
    salary: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    skillsRequired: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "skills_required",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applyUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "apply_url",
    },

    // ── Company geo/rating ─────────────────────────────────────
    companyRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "company_rating",
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    // ── Dates ──────────────────────────────────────────────────
    postedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "posted_date",
    },
    expiresAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "expires_at",
    },

    // ── Status ─────────────────────────────────────────────────
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "active",
    },

    // ── Legacy ─────────────────────────────────────────────────
    applicants: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    postedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "posted_by",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

export default Job;
