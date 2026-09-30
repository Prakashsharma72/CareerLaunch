import { DataTypes } from "sequelize";
import db from "../config/db.js";

const NotificationOutbox = db.define("NotificationOutbox", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  incidentId: { type: DataTypes.INTEGER, allowNull: false, field: "incident_id" },
  emailType: { type: DataTypes.STRING(64), allowNull: false, field: "email_type" },
  status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "pending" },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  availableAt: { type: DataTypes.DATE, allowNull: false, field: "available_at" },
  claimedAt: { type: DataTypes.DATE, allowNull: true, field: "claimed_at" },
  sentAt: { type: DataTypes.DATE, allowNull: true, field: "sent_at" },
  uncertain: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lastError: { type: DataTypes.STRING(255), allowNull: true, field: "last_error" },
}, { tableName: "notification_outbox", timestamps: true, underscored: true, indexes: [{ unique: true, fields: ["incident_id", "email_type"] }] });

export default NotificationOutbox;
