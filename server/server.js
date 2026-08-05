/**
 * server.js — CareerLaunch AI  entry point
 *
 * Boot order:
 *   1. Load .env  (dotenv)
 *   2. Validate / generate JWT_SECRET  (ensureSecret)
 *   3. Connect to DB  (sequelize)
 *   4. Sync models + run migrations
 *   5. Start HTTP server
 *
 * Startup log lines (in order):
 *   ✓ Environment loaded
 *   ✓ JWT Secret loaded
 *   ✓ Database connected
 *   ✓ Authentication initialized
 */

/* ── Step 1: environment must be loaded before any other import ─────────── */
import dotenv from "dotenv";
dotenv.config();

/* ── Step 2: guarantee a strong JWT_SECRET ──────────────────────────────── */
import { ensureJwtSecret } from "./config/ensureSecret.js";
ensureJwtSecret();

/* ── Remaining imports (safe to import after env is ready) ──────────────── */
import app       from "./app.js";
import sequelize from "./config/db.js";

const LOG = "[server]";
const log = (msg) => console.log(`${new Date().toISOString()} ${LOG} ${msg}`);

/* ─────────────────────────────────────────────────────────────────────────
   Column-addition migration helper (dialect-aware)
───────────────────────────────────────────────────────────────────────── */
async function addColumnIfMissing(table, column, definition) {
  const dialect = sequelize.getDialect();

  if (dialect === "sqlite") {
    const [cols] = await sequelize.query(`PRAGMA table_info(${table})`);
    if (!cols.some(c => c.name === column)) {
      await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      log(`  ✔ [sqlite] Added ${table}.${column}`);
    }
  } else {
    const [cols] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = :table
         AND COLUMN_NAME  = :column`,
      { replacements: { table, column } }
    );
    if (cols.length === 0) {
      await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      log(`  ✔ [mysql] Added ${table}.${column}`);
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Table-creation helper — creates table only if it doesn't exist yet
───────────────────────────────────────────────────────────────────────── */
async function createTableIfMissing(table, ddl) {
  const dialect = sequelize.getDialect();
  let exists = false;

  if (dialect === "sqlite") {
    const [rows] = await sequelize.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=:table`,
      { replacements: { table } }
    );
    exists = rows.length > 0;
  } else {
    const [rows] = await sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
      { replacements: { table } }
    );
    exists = rows.length > 0;
  }

  if (!exists) {
    await sequelize.query(ddl);
    log(`  ✔ Created table: ${table}`);
  }
}

async function runMigrations() {
  const dialect = sequelize.getDialect();
  log(`Running migrations (dialect: ${dialect})…`);

  // ── 1. Create missing tables ────────────────────────────────────────────
  const AI = dialect === "sqlite" ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT AUTO_INCREMENT PRIMARY KEY";
  const NOW = dialect === "sqlite" ? "CURRENT_TIMESTAMP" : "CURRENT_TIMESTAMP";

  await createTableIfMissing("companies", `
    CREATE TABLE companies (
      id              ${AI},
      place_id        VARCHAR(255) UNIQUE,
      company_name    VARCHAR(255) NOT NULL,
      website         VARCHAR(512),
      career_page     VARCHAR(512),
      address         TEXT,
      phone           VARCHAR(50),
      rating          FLOAT,
      latitude        DOUBLE,
      longitude       DOUBLE,
      maps_url        VARCHAR(512),
      business_status VARCHAR(100),
      opening_hours   TEXT,
      types           TEXT,
      city            VARCHAR(100),
      state           VARCHAR(100),
      country         VARCHAR(100),
      logo            TEXT,
      industry        VARCHAR(100),
      keyword         VARCHAR(255),
      created_at      DATETIME DEFAULT ${NOW},
      updated_at      DATETIME DEFAULT ${NOW}
    )
  `);

  await createTableIfMissing("saved_companies", `
    CREATE TABLE saved_companies (
      id                  ${AI},
      user_id             INT NOT NULL,
      company_id          INT,
      external_company_id VARCHAR(255),
      source              VARCHAR(100),
      company_name        VARCHAR(255),
      logo                TEXT,
      website             TEXT,
      address             TEXT,
      phone               VARCHAR(50),
      rating              FLOAT,
      maps_url            TEXT,
      career_page         TEXT,
      industry            VARCHAR(100),
      city                VARCHAR(100),
      created_at          DATETIME DEFAULT ${NOW},
      updated_at          DATETIME DEFAULT ${NOW}
    )
  `);

  await createTableIfMissing("interview_questions", `
    CREATE TABLE interview_questions (
      id               ${AI},
      session_id       INT NOT NULL,
      question_number  INT NOT NULL,
      category         VARCHAR(255) DEFAULT 'technical',
      question         TEXT NOT NULL,
      user_answer      TEXT,
      feedback         TEXT,
      score            FLOAT,
      skipped          TINYINT(1) DEFAULT 0,
      created_at       DATETIME DEFAULT ${NOW},
      updated_at       DATETIME DEFAULT ${NOW}
    )
  `);

  await createTableIfMissing("chats", `
    CREATE TABLE chats (
      id         ${AI},
      user_id    INT NOT NULL,
      message    TEXT,
      response   TEXT,
      created_at DATETIME DEFAULT ${NOW},
      updated_at DATETIME DEFAULT ${NOW}
    )
  `);

  // ── 2. Add missing columns to existing tables ───────────────────────────
  const columns = [
    // interview_sessions
    ["interview_sessions", "user_id",           "INT"],
    ["interview_sessions", "role",              "VARCHAR(255)"],
    ["interview_sessions", "difficulty",        "VARCHAR(255)"],
    ["interview_sessions", "status",            "VARCHAR(50) DEFAULT 'active'"],
    ["interview_sessions", "total_questions",   "INT DEFAULT 0"],
    ["interview_sessions", "answered_questions","INT DEFAULT 0"],
    ["interview_sessions", "overall_score",     "FLOAT DEFAULT 0"],
    ["interview_sessions", "report",            "TEXT"],

    // companies — Google Places v2 columns
    ["companies", "logo",              "TEXT"],
    ["companies", "industry",          "VARCHAR(100)"],
    ["companies", "state",             "VARCHAR(100)"],
    ["companies", "country",           "VARCHAR(100)"],
    ["companies", "short_address",     "TEXT"],
    ["companies", "review_count",      "INT"],
    ["companies", "is_open_now",       "TINYINT(1)"],
    ["companies", "editorial_summary", "TEXT"],
    ["companies", "photo_refs",        "TEXT"],

    // saved_companies
    ["saved_companies", "external_company_id", "VARCHAR(255)"],
    ["saved_companies", "source",              "VARCHAR(100)"],
    ["saved_companies", "company_name",        "VARCHAR(255)"],
    ["saved_companies", "logo",                "TEXT"],
    ["saved_companies", "website",             "TEXT"],
    ["saved_companies", "address",             "TEXT"],
    ["saved_companies", "phone",               "VARCHAR(50)"],
    ["saved_companies", "rating",              "FLOAT"],
    ["saved_companies", "maps_url",            "TEXT"],
    ["saved_companies", "career_page",         "TEXT"],
    ["saved_companies", "industry",            "VARCHAR(100)"],
    ["saved_companies", "city",                "VARCHAR(100)"],

    // saved_jobs
    ["saved_jobs", "external_job_id", "VARCHAR(255)"],
    ["saved_jobs", "source",          "VARCHAR(100)"],
    ["saved_jobs", "title",           "VARCHAR(255)"],
    ["saved_jobs", "company",         "VARCHAR(255)"],
    ["saved_jobs", "company_logo",    "TEXT"],
    ["saved_jobs", "location",        "VARCHAR(255)"],
    ["saved_jobs", "salary",          "VARCHAR(255)"],
    ["saved_jobs", "employment_type", "VARCHAR(100)"],
    ["saved_jobs", "apply_url",       "TEXT"],
    ["saved_jobs", "posted_date",     "VARCHAR(50)"],

    // jobs
    ["jobs", "external_job_id",  "VARCHAR(255)"],
    ["jobs", "source",           "VARCHAR(100) DEFAULT 'manual'"],
    ["jobs", "google_place_id",  "VARCHAR(255)"],
    ["jobs", "company_logo",     "TEXT"],
    ["jobs", "website",          "VARCHAR(512)"],
    ["jobs", "career_page",      "VARCHAR(512)"],
    ["jobs", "employment_type",  "VARCHAR(50)"],
    ["jobs", "salary",           "VARCHAR(100)"],
    ["jobs", "apply_url",        "TEXT"],
    ["jobs", "company_rating",   "FLOAT"],
    ["jobs", "latitude",         "DOUBLE"],
    ["jobs", "longitude",        "DOUBLE"],
    ["jobs", "posted_date",      "DATE"],
    ["jobs", "expires_at",       "DATE"],
    ["jobs", "status",           "VARCHAR(20) DEFAULT 'active'"],
    ["jobs", "applicants",       "TEXT"],

    // resume_analyses
    ["resume_analyses", "feedback",   "TEXT"],
    ["resume_analyses", "resume_url", "TEXT"],
    ["resume_analyses", "ats_score",  "FLOAT"],
  ];

  for (const [table, column, definition] of columns) {
    await addColumnIfMissing(table, column, definition);
  }

  log("Migrations complete.");
}

/* ─────────────────────────────────────────────────────────────────────────
   STARTUP
───────────────────────────────────────────────────────────────────────── */
async function startServer() {
  /* ── Log 1: Environment ─────────────────────────────────────────────── */
  console.log("✓ Environment loaded");

  /* ── Log 2: JWT Secret ──────────────────────────────────────────────── */
  const secretLen = (process.env.JWT_SECRET || "").length;
  console.log(`✓ JWT Secret loaded  (${secretLen} chars)`);

  /* ── Validate secret is present before opening the HTTP port ─────────── */
  if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL: JWT_SECRET is not set. Aborting.");
    process.exit(1);
  }

  const dialect = process.env.DB_DIALECT || "sqlite";
  log(`Starting server — DB dialect: ${dialect}`);

  /* ── Log 3: Database ────────────────────────────────────────────────── */
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    // Run migrations BEFORE sync so columns exist when Sequelize validates
    await runMigrations();

    await sequelize.sync({ force: false });
    log("  ✔ Sequelize models synced");
  } catch (error) {
    console.error(`${new Date().toISOString()} ${LOG} ❌ Database connection failed:`, error.message);
    process.exit(1);
  }

  /* ── Log 4: Authentication ──────────────────────────────────────────── */
  console.log("✓ Authentication initialized");

  /* ── HTTP server ────────────────────────────────────────────────────── */
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    log(`🚀 HTTP server running on port ${PORT}`);
    log(`   POST http://localhost:${PORT}/api/auth/register`);
    log(`   POST http://localhost:${PORT}/api/auth/login`);
    log(`   GET  http://localhost:${PORT}/api/jobs`);
    log(`   GET  http://localhost:${PORT}/api/companies`);
  });
}

startServer();
