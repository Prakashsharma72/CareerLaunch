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
