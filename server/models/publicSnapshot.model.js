import { DataTypes } from "sequelize";
import db from "../config/db.js";

const PublicSnapshot = db.define(
  "PublicSnapshot",
  {
    scope: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "generated_at",
    },
  },
  {
    tableName: "public_snapshots",
    timestamps: false,
  }
);

export default PublicSnapshot;
