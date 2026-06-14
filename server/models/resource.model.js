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
  },
  {
    tableName: "resources",
    timestamps: true,
  }
);

export default Resource;