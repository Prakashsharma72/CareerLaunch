/**
 * SavedCompany model — stores bookmark data inline.
 * NO foreign key to companies table. Live company data stored at save time.
 */
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const SavedCompany = db.define(
  "SavedCompany",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.INTEGER, allowNull: false, field: "user_id",
    },

    // Legacy nullable FK — kept for existing rows
    companyId: {
      type: DataTypes.INTEGER, allowNull: true, field: "company_id",
    },

    // ── Inline company data saved at bookmark time ──────────────
    externalCompanyId: { type: DataTypes.STRING(255), allowNull: true, field: "external_company_id" },
    source:            { type: DataTypes.STRING(100), allowNull: true },
    companyName:       { type: DataTypes.STRING(255), allowNull: true, field: "company_name" },
    logo:              { type: DataTypes.TEXT,        allowNull: true },
    website:           { type: DataTypes.TEXT,        allowNull: true },
    address:           { type: DataTypes.TEXT,        allowNull: true },
    phone:             { type: DataTypes.STRING(50),  allowNull: true },
    rating:            { type: DataTypes.FLOAT,       allowNull: true },
    mapsUrl:           { type: DataTypes.TEXT,        allowNull: true, field: "maps_url" },
    careerPage:        { type: DataTypes.TEXT,        allowNull: true, field: "career_page" },
    industry:          { type: DataTypes.STRING(100), allowNull: true },
    city:              { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    tableName:  "saved_companies",
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ["user_id", "external_company_id"] }],
  }
);

export default SavedCompany;
