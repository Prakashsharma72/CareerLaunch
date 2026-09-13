import { DataTypes } from "sequelize";
import db from "../config/db.js";

const RoadmapProgress = db.define("RoadmapProgress", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
  roadmapId: { type: DataTypes.INTEGER, allowNull: false, field: "roadmap_id" },
  stepId: { type: DataTypes.INTEGER, allowNull: false, field: "step_id" },
  completedAt: { type: DataTypes.DATE, field: "completed_at" },
  createdAt: { type: DataTypes.DATE, field: "created_at", defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, field: "updated_at", defaultValue: DataTypes.NOW },
}, { tableName: "roadmap_progress", timestamps: false });

export default RoadmapProgress;