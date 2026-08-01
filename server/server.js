import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/db.js";

/**
 * Run any one-time column additions that ALTER TABLE can't handle
 * via sync({ alter: true }) due to SQLite constraints.
 * Each migration is idempotent — it checks before adding.
 */
async function runMigrations() {
  const addColumnIfMissing = async (table, column, definition) => {
    const [cols] = await sequelize.query(`PRAGMA table_info(${table})`);
    if (!cols.some((c) => c.name === column)) {
      await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`  ✔ Added column ${table}.${column}`);
    }
  };

  // interview_sessions was created before userId was in the model
  await addColumnIfMissing("interview_sessions", "user_id", "INTEGER");
}

const startServer = async () => {
  try {
    await sequelize.authenticate();

    // Create any missing tables (no alter — avoids SQLite rebuild failures)
    await sequelize.sync({ force: false });

    // Patch columns that sync() won't add to existing tables
    await runMigrations();

    console.log("✅ Database connected and models synced");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
