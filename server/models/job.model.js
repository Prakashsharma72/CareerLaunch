import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Job = db.define(
  "Job",
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

    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    location: {
      type: DataTypes.STRING,
    },

    salary: {
      type: DataTypes.STRING,
    },

    type: {
      type: DataTypes.STRING, // Full-time, Internship etc
    },

    applicants: {
      type: DataTypes.JSON, // store array of user IDs
      defaultValue: [],
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

export default Job;