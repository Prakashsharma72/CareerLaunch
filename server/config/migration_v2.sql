-- ============================================================
-- CareerLaunch AI — Migration v2
-- Adds all missing columns to existing tables.
-- Safe to run multiple times (uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS style).
-- For SQLite: manually add columns if they don't exist.
-- For MySQL: run each ALTER statement once.
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone        VARCHAR(20)   DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location     VARCHAR(255)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio          TEXT          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills       TEXT          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience   TEXT          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education    TEXT          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_url   TEXT          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github       VARCHAR(255)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin     VARCHAR(255)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio    VARCHAR(255)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT         DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob          DATE          DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender       VARCHAR(50)   DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS college      VARCHAR(255)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS degree       VARCHAR(100)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch       VARCHAR(100)  DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS grad_year    VARCHAR(10)   DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages    VARCHAR(255)  DEFAULT NULL;

-- ── JOBS ─────────────────────────────────────────────────────
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_job_id  VARCHAR(255)  DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo     TEXT          DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS website          VARCHAR(512)  DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_page      VARCHAR(512)  DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employment_type  VARCHAR(50)   DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary           VARCHAR(100)  DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_required  TEXT          DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source           VARCHAR(100)  DEFAULT 'manual';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS google_place_id  VARCHAR(255)  DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url        TEXT          DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_rating   FLOAT         DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude         DOUBLE        DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude        DOUBLE        DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_date      DATE          DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expires_at       DATE          DEFAULT NULL;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status           VARCHAR(20)   DEFAULT 'active';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50)   DEFAULT 'Fresher';

-- ── COMPANIES (create if not exists) ─────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id      VARCHAR(255) UNIQUE,
    company_name  VARCHAR(255) NOT NULL,
    website       VARCHAR(512),
    career_page   VARCHAR(512),
    address       TEXT,
    phone         VARCHAR(50),
    rating        FLOAT,
    latitude      DOUBLE,
    longitude     DOUBLE,
    maps_url      VARCHAR(512),
    business_status VARCHAR(100),
    opening_hours TEXT,
    types         TEXT,
    city          VARCHAR(100),
    state         VARCHAR(100),
    country       VARCHAR(100),
    logo          TEXT,
    industry      VARCHAR(100),
    keyword       VARCHAR(255),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── SAVED COMPANIES (create if not exists) ────────────────────
CREATE TABLE IF NOT EXISTS saved_companies (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- ── SAVED JOBS — ensure foreign key exists ────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id  INTEGER NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_jobs_status       ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_source       ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_companies_place   ON companies(place_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user   ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_comp_user   ON saved_companies(user_id);
