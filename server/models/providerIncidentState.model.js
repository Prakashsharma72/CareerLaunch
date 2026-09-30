import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ProviderIncidentState = db.define("ProviderIncidentState", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  groupKey: { type: DataTypes.STRING(191), allowNull: false, unique: true, field: "group_key" },
  environment: { type: DataTypes.STRING(32), allowNull: false },
  provider: { type: DataTypes.STRING(64), allowNull: false },
  integration: { type: DataTypes.STRING(64), allowNull: false },
  currentIncidentId: { type: DataTypes.INTEGER, allowNull: true, field: "current_incident_id" },
  consecutiveSuccesses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "consecutive_successes" },
  lastSuccessAt: { type: DataTypes.DATE, allowNull: true, field: "last_success_at" },
}, { tableName: "provider_incident_states", timestamps: true, underscored: true });

export default ProviderIncidentState;
