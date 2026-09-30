import { DataTypes } from "sequelize";
import db from "../config/db.js";

const UserNotificationPreference = db.define("UserNotificationPreference", {
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "user_id" },
  jobAlerts: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "job_alerts" },
  resourceUpdates: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "resource_updates" },
  learningReminders: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "learning_reminders" },
  announcements: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "user_notification_preferences", timestamps: true, underscored: true });

// user_id is the primary key in the migration; this table intentionally has no id column.
UserNotificationPreference.removeAttribute("id");

export default UserNotificationPreference;
