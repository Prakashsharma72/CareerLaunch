import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ProviderIncident = db.define("ProviderIncident", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  groupKey: { type: DataTypes.STRING(191), allowNull: false, field: "group_key" },
  environment: { type: DataTypes.STRING(32), allowNull: false },
  provider: { type: DataTypes.STRING(64), allowNull: false },
  integration: { type: DataTypes.STRING(64), allowNull: false },
  status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "open" },
  severity: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "high" },
  firstSeenAt: { type: DataTypes.DATE, allowNull: false, field: "first_seen_at" },
  lastSeenAt: { type: DataTypes.DATE, allowNull: false, field: "last_seen_at" },
  resolvedAt: { type: DataTypes.DATE, allowNull: true, field: "resolved_at" },
  failureCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: "failure_count" },
  recoverySuccesses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "recovery_successes" },
  errorCode: { type: DataTypes.STRING(64), allowNull: true, field: "error_code" },
  reason: { type: DataTypes.STRING(255), allowNull: false },
  fallbackAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "fallback_available" },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: "provider_incidents", timestamps: true, underscored: true });

export default ProviderIncident;
