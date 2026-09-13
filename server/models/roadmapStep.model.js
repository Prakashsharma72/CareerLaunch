import { DataTypes } from "sequelize";
import db from "../config/db.js";

const RoadmapStep = db.define("RoadmapStep", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roadmapId: { type: DataTypes.INTEGER, allowNull: false, field: "roadmap_id" },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  topics: { type: DataTypes.TEXT, allowNull: true },
  estimatedTime: { type: DataTypes.STRING(100), field: "estimated_time" },
  practiceTask: { type: DataTypes.TEXT, field: "practice_task" },
  stepOrder: { type: DataTypes.INTEGER, allowNull: false, field: "step_order" },
  createdAt: { type: DataTypes.DATE, field: "created_at", defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, field: "updated_at", defaultValue: DataTypes.NOW },
}, { tableName: "roadmap_steps", timestamps: false });

export default RoadmapStep;