import { DataTypes } from "sequelize";
import db from "../config/db.js";

const AdminNotificationRead = db.define("AdminNotificationRead", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  notificationId: { type: DataTypes.INTEGER, allowNull: false, field: "notification_id" },
  adminId: { type: DataTypes.INTEGER, allowNull: false, field: "admin_id" },
  readAt: { type: DataTypes.DATE, allowNull: false, field: "read_at" },
}, { tableName: "admin_notification_reads", timestamps: false, indexes: [{ unique: true, fields: ["notification_id", "admin_id"] }] });

export default AdminNotificationRead;
