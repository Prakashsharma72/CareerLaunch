import { DataTypes } from "sequelize";
import db from "../config/db.js";

const UserNotificationCursor = db.define("UserNotificationCursor", {
  userId: { type: DataTypes.INTEGER, autoIncrement: false, primaryKey: true, field: "user_id" },
  initializedAt: { type: DataTypes.DATE, allowNull: false, field: "initialized_at" },
  lastScannedAt: { type: DataTypes.DATE, allowNull: false, field: "last_scanned_at" },
}, { tableName: "user_notification_cursors", timestamps: true, underscored: true });

export default UserNotificationCursor;
