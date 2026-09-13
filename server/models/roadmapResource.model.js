import { DataTypes } from "sequelize";
import db from "../config/db.js";

const RoadmapResource = db.define("RoadmapResource", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  stepId: { type: DataTypes.INTEGER, allowNull: false, field: "step_id" },
  label: { type: DataTypes.STRING(255), allowNull: false },
  type: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "Article" },
  sourceType: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "link", field: "source_type" },
  url: { type: DataTypes.TEXT, allowNull: false },
  storagePublicId: { type: DataTypes.STRING(500), field: "storage_public_id" },
  originalName: { type: DataTypes.STRING(255), field: "original_name" },
  mimeType: { type: DataTypes.STRING(150), field: "mime_type" },
  fileSize: { type: DataTypes.BIGINT, field: "file_size" },
  resourceType: { type: DataTypes.STRING(16), field: "resource_type" },
  resourceOrder: { type: DataTypes.INTEGER, field: "resource_order", defaultValue: 0 },
}, { tableName: "roadmap_resources", timestamps: false });

export default RoadmapResource;