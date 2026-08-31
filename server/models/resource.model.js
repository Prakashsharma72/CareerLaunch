import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Resource = db.define(
  "Resource",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
    },

    // Map createdAt and updatedAt to match DB columns
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "resources",
    timestamps: true,
    underscored: true,
  }
);

export default Resource;