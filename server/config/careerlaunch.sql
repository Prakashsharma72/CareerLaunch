-- =============================================================================
-- CareerLaunch AI — Master Database Schema
-- Dialect: SQLite (also valid PostgreSQL with minor type adjustments)
--
-- This file is the single source of truth.
-- It reflects the exact Sequelize model definitions in server/models/.
-- Drop and recreate the database from this file for a clean slate.
-- =============================================================================


-- ── USERS ─────────────────────────────────────────────────────────────────────
-- model: user.model.js
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER       PRIMARY KEY AUTOINCREMENT,
    name          VARCHAR(255)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    role          VARCHAR(50)   NOT NULL DEFAULT 'student',
    phone         VARCHAR(20),
    education     TEXT,
    skills        TEXT,
    resume_url    TEXT,
    profile_image TEXT,
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ── RESOURCES ─────────────────────────────────────────────────────────────────
-- model: resource.model.js  (timestamps: true → createdAt + updatedAt)
CREATE TABLE IF NOT EXISTS resources (
    id          INTEGER      PRIMARY KEY AUTOINCREMENT,
    title       VARCHAR(255) NOT NULL,
    category    VARCHAR(255),
    link        TEXT         NOT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);


-- ── JOBS ──────────────────────────────────────────────────────────────────────
-- model: job.model.js  (timestamps: true → createdAt + updatedAt)
CREATE TABLE IF NOT EXISTS jobs (
    id               INTEGER      PRIMARY KEY AUTOINCREMENT,

    -- identity / source
    external_job_id  VARCHAR(255),
    source           VARCHAR(100) DEFAULT 'manual',
    google_place_id  VARCHAR(255),

    -- core
    title            VARCHAR(255) NOT NULL,
    company          VARCHAR(255) NOT NULL,
    company_logo     TEXT,
    website          VARCHAR(512),
    career_page      VARCHAR(512),
    location         VARCHAR(255),

    -- job details
    employment_type  VARCHAR(50),
    experience_level VARCHAR(50)  DEFAULT 'Fresher',
    salary           VARCHAR(100),
    skills_required  TEXT,
    description      TEXT,
    apply_url        TEXT,

    -- geo / rating
    company_rating   REAL,
    latitude         REAL,
    longitude        REAL,

    -- dates / status
    posted_date      DATE,
    expires_at       DATE,
    status           VARCHAR(20)  DEFAULT 'active',

    -- legacy
    applicants       TEXT         DEFAULT '[]',   -- JSON array
    posted_by        INTEGER      REFERENCES users(id) ON DELETE SET NULL,

    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_title    ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_company  ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_status   ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_source   ON jobs(source);


-- ── COMPANIES ─────────────────────────────────────────────────────────────────
-- model: company.model.js  (timestamps: true → createdAt + updatedAt)
-- Data source: Google Places API v2 only (place_id is the unique key).
CREATE TABLE IF NOT EXISTS companies (
    id              INTEGER      PRIMARY KEY AUTOINCREMENT,
    place_id        VARCHAR(255) UNIQUE,         -- Google place_id (dedup key)
    company_name    VARCHAR(255) NOT NULL,
    website         VARCHAR(512),
    career_page     VARCHAR(512),
    address         TEXT,
    short_address   TEXT,
    phone           VARCHAR(50),
    rating          REAL,
    review_count    INTEGER,
    latitude        REAL,
    longitude       REAL,
    maps_url        VARCHAR(512),
    business_status VARCHAR(100),
    opening_hours   TEXT,                        -- JSON array of weekday strings
    is_open_now     INTEGER,                     -- BOOLEAN 0/1
    types           TEXT,                        -- JSON
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    logo            TEXT,
    industry        VARCHAR(100),
    keyword         VARCHAR(255),
    editorial_summary TEXT,
    photo_refs      TEXT,                        -- JSON array of Google photo resource names
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_place_id ON companies(place_id);
CREATE INDEX IF NOT EXISTS idx_companies_city     ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_rating   ON companies(rating);


-- ── SAVED JOBS ────────────────────────────────────────────────────────────────
-- model: savedJob.model.js  (timestamps: false)
-- Inline job data — NO foreign key to jobs table.
-- job_id kept nullable for legacy rows only.
CREATE TABLE IF NOT EXISTS saved_jobs (
    id               INTEGER      PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- legacy (nullable)
    job_id           INTEGER,

    -- inline snapshot of job data at save time
    external_job_id  VARCHAR(255),
    source           VARCHAR(100),
    title            VARCHAR(255),
    company          VARCHAR(255),
    company_logo     TEXT,
    location         VARCHAR(255),
    salary           VARCHAR(255),
    employment_type  VARCHAR(100),
    apply_url        TEXT,
    posted_date      VARCHAR(50),

    saved_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, external_job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);


-- ── SAVED COMPANIES ───────────────────────────────────────────────────────────
-- model: savedCompany.model.js  (timestamps: true → createdAt + updatedAt)
-- Inline company data — NO foreign key to companies table.
-- company_id kept nullable for legacy rows only.
CREATE TABLE IF NOT EXISTS saved_companies (
    id                  INTEGER      PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- legacy (nullable)
    company_id          INTEGER,

    -- inline snapshot of company data at save time
    external_company_id VARCHAR(255),
    source              VARCHAR(100),
    company_name        VARCHAR(255),
    logo                TEXT,
    website             TEXT,
    address             TEXT,
    phone               VARCHAR(50),
    rating              REAL,
    maps_url            TEXT,
    career_page         TEXT,
    industry            VARCHAR(100),
    city                VARCHAR(100),

    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, external_company_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_companies_user ON saved_companies(user_id);


-- ── APPLICATIONS ──────────────────────────────────────────────────────────────
-- model: application.model.js  (timestamps: false)
CREATE TABLE IF NOT EXISTS applications (
    id         INTEGER     PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     INTEGER     NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
    status     VARCHAR(50) DEFAULT 'Applied',
    applied_at DATETIME    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job  ON applications(job_id);


-- ── ROADMAPS ──────────────────────────────────────────────────────────────────
-- model: roadmap.model.js  (timestamps: false)
CREATE TABLE IF NOT EXISTS roadmaps (
    id              INTEGER      PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    target_role     VARCHAR(100),
    roadmap_content TEXT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);


-- ── RESUME ANALYSES ───────────────────────────────────────────────────────────
-- model: resumeAnalysis.model.js  (timestamps: false)
CREATE TABLE IF NOT EXISTS resume_analyses (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ats_score  REAL,
    feedback   TEXT,
    resume_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ── INTERVIEW SESSIONS ────────────────────────────────────────────────────────
-- model: interviewSession.model.js  (timestamps: true → createdAt + updatedAt)
CREATE TABLE IF NOT EXISTS interview_sessions (
    id                 INTEGER     PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role               VARCHAR(255) NOT NULL,
    difficulty         VARCHAR(255) NOT NULL,
    status             VARCHAR(50)  DEFAULT 'active',
    total_questions    INTEGER      DEFAULT 0,
    answered_questions INTEGER      DEFAULT 0,
    overall_score      REAL         DEFAULT 0,
    report             TEXT,
    created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     DEFAULT CURRENT_TIMESTAMP
);


-- ── INTERVIEW QUESTIONS ───────────────────────────────────────────────────────
-- model: interviewQuestion.model.js  (timestamps: true → createdAt + updatedAt)
CREATE TABLE IF NOT EXISTS interview_questions (
    id              INTEGER      PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER      NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_number INTEGER      NOT NULL,
    category        VARCHAR(255) DEFAULT 'technical',
    question        TEXT         NOT NULL,
    user_answer     TEXT,
    feedback        TEXT,                          -- JSON
    score           REAL,
    skipped         INTEGER      DEFAULT 0,        -- BOOLEAN (0/1)
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);


-- ── CHATS ─────────────────────────────────────────────────────────────────────
-- model: chat.model.js  (timestamps: true → createdAt + updatedAt)
CREATE TABLE IF NOT EXISTS chats (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER  NOT NULL,
    message    TEXT,
    response   TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
