import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Company from "./company.model.js";

const SavedCompany = db.define(
  "SavedCompany",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "company_id",
      references: { model: Company, key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "saved_companies",
    timestamps: true,
    indexes: [{ unique: true, fields: ["user_id", "company_id"] }],
  }
);

SavedCompany.belongsTo(Company, { foreignKey: "company_id", as: "company" });
Company.hasMany(SavedCompany,   { foreignKey: "company_id", as: "savedBy" });

export default SavedCompany;
