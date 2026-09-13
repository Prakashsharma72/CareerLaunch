import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Roadmap = db.define(
  "Roadmap",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    targetRole: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "target_role",
    },
    roadmapContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "roadmap_content",
    },
    shortDescription: { type: DataTypes.STRING(500), field: "short_description" },
    category: { type: DataTypes.STRING(100) },
    difficulty: { type: DataTypes.STRING(32), defaultValue: "Beginner" },
    durationWeeks: { type: DataTypes.INTEGER, field: "duration_weeks" },
    coverUrl: { type: DataTypes.TEXT, field: "cover_url" },
    pdfUrl: { type: DataTypes.TEXT, field: "pdf_url" },
    pdfName: { type: DataTypes.STRING(255), field: "pdf_name" },
    status: { type: DataTypes.STRING(20), defaultValue: "draft" },
    publishedAt: { type: DataTypes.DATE, field: "published_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at", defaultValue: DataTypes.NOW },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "roadmaps",
    timestamps: false,
  }
);

export default Roadmap;
