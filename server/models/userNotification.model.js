import { DataTypes } from "sequelize";
import db from "../config/db.js";

const UserNotification = db.define("UserNotification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
  eventKey: { type: DataTypes.STRING(191), allowNull: false, field: "event_key" },
  type: { type: DataTypes.STRING(64), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  link: { type: DataTypes.STRING(512), allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  readAt: { type: DataTypes.DATE, allowNull: true, field: "read_at" },
  dismissedAt: { type: DataTypes.DATE, allowNull: true, field: "dismissed_at" },
}, {
  tableName: "user_notifications",
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ["user_id", "event_key"] },
    { fields: ["user_id", "read_at", "dismissed_at", "created_at"] },
    { fields: ["user_id", "type"] },
  ],
});

export default UserNotification;
