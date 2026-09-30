import { DataTypes } from "sequelize";
import db from "../config/db.js";

const AdminNotification = db.define("AdminNotification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.STRING(64), allowNull: false },
  severity: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "info" },
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  link: { type: DataTypes.STRING(512), allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: "user_id" },
  userName: { type: DataTypes.STRING(255), allowNull: true, field: "user_name" },
  userEmail: { type: DataTypes.STRING(255), allowNull: true, field: "user_email" },
  eventKey: { type: DataTypes.STRING(191), allowNull: true, unique: true, field: "event_key" },
  incidentId: { type: DataTypes.INTEGER, allowNull: true, field: "incident_id" },
  resolved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: "admin_notifications", timestamps: true, underscored: true });

export default AdminNotification;
