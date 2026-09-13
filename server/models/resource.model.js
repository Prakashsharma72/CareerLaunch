import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Resource = db.define(
  "Resource",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(64), allowNull: false },
    resourceType: { type: DataTypes.STRING(32), allowNull: false, field: "resource_type" },
    link: { type: DataTypes.TEXT, allowNull: true },
    fileUrl: { type: DataTypes.TEXT, allowNull: true, field: "file_url" },
    fileName: { type: DataTypes.STRING(255), allowNull: true, field: "file_name" },
    fileMimeType: { type: DataTypes.STRING(100), allowNull: true, field: "file_mime_type" },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "published" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  { tableName: "resources", timestamps: true, underscored: true }
);

export default Resource;