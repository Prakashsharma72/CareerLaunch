/**
 * company.model.js  — Google Places data cache
 *
 * Keyed by place_id (unique). All data comes from Google Places API v2.
 * New columns: short_address, review_count, is_open_now, editorial_summary, photo_refs.
 */
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Company = db.define(
  "Company",
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    placeId: {
      type:      DataTypes.STRING(255),
      allowNull: true,
      unique:    true,
      field:     "place_id",
    },
    companyName: {
      type:      DataTypes.STRING(255),
      allowNull: false,
      field:     "company_name",
    },
    website: {
      type:      DataTypes.STRING(512),
      allowNull: true,
    },
    careerPage: {
      type:      DataTypes.STRING(512),
      allowNull: true,
      field:     "career_page",
    },
    address: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    shortAddress: {
      type:      DataTypes.TEXT,
      allowNull: true,
      field:     "short_address",
    },
    phone: {
      type:      DataTypes.STRING(50),
      allowNull: true,
    },
    rating: {
      type:      DataTypes.FLOAT,
      allowNull: true,
    },
    reviewCount: {
      type:      DataTypes.INTEGER,
      allowNull: true,
      field:     "review_count",
    },
    latitude: {
      type:      DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type:      DataTypes.DOUBLE,
      allowNull: true,
    },
    mapsUrl: {
      type:      DataTypes.STRING(512),
      allowNull: true,
      field:     "maps_url",
    },
    businessStatus: {
      type:      DataTypes.STRING(100),
      allowNull: true,
      field:     "business_status",
    },
    openingHours: {
      type:      DataTypes.JSON,
      allowNull: true,
      field:     "opening_hours",
    },
    isOpenNow: {
      type:         DataTypes.BOOLEAN,
      allowNull:    true,
      field:        "is_open_now",
    },
    types: {
      type:      DataTypes.JSON,
      allowNull: true,
    },
    city:     { type: DataTypes.STRING(100), allowNull: true },
    state:    { type: DataTypes.STRING(100), allowNull: true },
    country:  { type: DataTypes.STRING(100), allowNull: true },
    logo:     { type: DataTypes.TEXT,        allowNull: true },
    industry: { type: DataTypes.STRING(100), allowNull: true },
    keyword:  { type: DataTypes.STRING(255), allowNull: true },
    editorialSummary: {
      type:      DataTypes.TEXT,
      allowNull: true,
      field:     "editorial_summary",
    },
    photoRefs: {
      type:      DataTypes.JSON,
      allowNull: true,
      field:     "photo_refs",
    },
  },
  {
    tableName:  "companies",
    timestamps: true,
  }
);

export default Company;
