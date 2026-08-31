-- =============================================================================
-- CareerLaunch AI — MySQL Schema
-- Generated from Sequelize model definitions in server/models/
--
-- HOW TO IMPORT IN XAMPP:
--   1. Open phpMyAdmin  →  http://localhost/phpmyadmin
--   2. Create database `careerlaunch`  (Collation: utf8mb4_unicode_ci)
--   3. Select `careerlaunch`  →  click SQL tab
--   4. Paste this entire file  →  click Go
--
-- This script is idempotent: safe to re-run on an existing database.
-- It drops all tables first (in FK-safe order) then recreates them.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── DROP (FK-safe order: children first, parents last) ────────────────────────
DROP TABLE IF EXISTS `interview_questions`;
DROP TABLE IF EXISTS `interview_sessions`;
DROP TABLE IF EXISTS `roadmaps`;
DROP TABLE IF EXISTS `saved_companies`;
DROP TABLE IF EXISTS `saved_jobs`;
DROP TABLE IF EXISTS `chats`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;


-- ── USERS ─────────────────────────────────────────────────────────────────────
-- model: user.model.js
-- timestamps: true  |  updatedAt: false  →  only created_at column
CREATE TABLE `users` (
  `id`            INT            NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(255)   NOT NULL,
  `email`         VARCHAR(255)   NOT NULL,
  `password`      VARCHAR(255)   NOT NULL,
  `role`          VARCHAR(50)    NOT NULL DEFAULT 'student',
  `phone`         VARCHAR(20)    DEFAULT NULL,
  `education`     TEXT           DEFAULT NULL,
  `skills`        TEXT           DEFAULT NULL,
  `resume_url`    TEXT           DEFAULT NULL,
  `profile_image` TEXT           DEFAULT NULL,
  `created_at`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── RESOURCES ─────────────────────────────────────────────────────────────────
-- model: resource.model.js
-- timestamps: true  →  created_at + updated_at  (Sequelize underscored default)
CREATE TABLE `resources` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255)   NOT NULL,
  `category`    VARCHAR(255)   DEFAULT NULL,
  `link`        TEXT           NOT NULL,
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resources_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── JOBS ──────────────────────────────────────────────────────────────────────
-- model: job.model.js
-- timestamps: true  →  createdAt / updatedAt  (Sequelize default column names)
CREATE TABLE `jobs` (
  `id`               INT            NOT NULL AUTO_INCREMENT,
  `external_job_id`  VARCHAR(255)   DEFAULT NULL,
  `source`           VARCHAR(100)   DEFAULT 'manual',
  `google_place_id`  VARCHAR(255)   DEFAULT NULL,
  `title`            VARCHAR(255)   NOT NULL,
  `company`          VARCHAR(255)   NOT NULL,
  `company_logo`     TEXT           DEFAULT NULL,
  `website`          VARCHAR(512)   DEFAULT NULL,
  `career_page`      VARCHAR(512)   DEFAULT NULL,
  `location`         VARCHAR(255)   DEFAULT NULL,
  `employment_type`  VARCHAR(50)    DEFAULT NULL,
  `experience_level` VARCHAR(50)    DEFAULT 'Fresher',
  `salary`           VARCHAR(100)   DEFAULT NULL,
  `skills_required`  TEXT           DEFAULT NULL,
  `description`      TEXT           DEFAULT NULL,
  `apply_url`        TEXT           DEFAULT NULL,
  `company_rating`   FLOAT          DEFAULT NULL,
  `latitude`         DOUBLE         DEFAULT NULL,
  `longitude`        DOUBLE         DEFAULT NULL,
  `posted_date`      DATE           DEFAULT NULL,
  `expires_at`       DATE           DEFAULT NULL,
  `status`           VARCHAR(20)    DEFAULT 'active',
  `applicants`       JSON           DEFAULT NULL,
  `posted_by`        INT            DEFAULT NULL,
  `createdAt`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_title`    (`title`),
  KEY `idx_jobs_company`  (`company`),
  KEY `idx_jobs_status`   (`status`),
  KEY `idx_jobs_source`   (`source`),
  CONSTRAINT `fk_jobs_posted_by` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── COMPANIES ─────────────────────────────────────────────────────────────────
-- model: company.model.js
-- timestamps: true  →  createdAt / updatedAt  (Sequelize default)
-- JSON columns: opening_hours, types, photo_refs
CREATE TABLE `companies` (
  `id`                INT            NOT NULL AUTO_INCREMENT,
  `place_id`          VARCHAR(255)   DEFAULT NULL,
  `company_name`      VARCHAR(255)   NOT NULL,
  `website`           VARCHAR(512)   DEFAULT NULL,
  `career_page`       VARCHAR(512)   DEFAULT NULL,
  `address`           TEXT           DEFAULT NULL,
  `short_address`     TEXT           DEFAULT NULL,
  `phone`             VARCHAR(50)    DEFAULT NULL,
  `rating`            FLOAT          DEFAULT NULL,
  `review_count`      INT            DEFAULT NULL,
  `latitude`          DOUBLE         DEFAULT NULL,
  `longitude`         DOUBLE         DEFAULT NULL,
  `maps_url`          VARCHAR(512)   DEFAULT NULL,
  `business_status`   VARCHAR(100)   DEFAULT NULL,
  `opening_hours`     JSON           DEFAULT NULL,
  `is_open_now`       TINYINT(1)     DEFAULT NULL,
  `types`             JSON           DEFAULT NULL,
  `city`              VARCHAR(100)   DEFAULT NULL,
  `state`             VARCHAR(100)   DEFAULT NULL,
  `country`           VARCHAR(100)   DEFAULT NULL,
  `logo`              TEXT           DEFAULT NULL,
  `industry`          VARCHAR(100)   DEFAULT NULL,
  `keyword`           VARCHAR(255)   DEFAULT NULL,
  `editorial_summary` TEXT           DEFAULT NULL,
  `photo_refs`        JSON           DEFAULT NULL,
  `createdAt`         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_companies_place_id` (`place_id`),
  KEY `idx_companies_city`   (`city`),
  KEY `idx_companies_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── SAVED JOBS ────────────────────────────────────────────────────────────────
-- model: savedJob.model.js
-- timestamps: false  |  id is BIGINT
-- No FK to jobs table — inline snapshot stored at save time
CREATE TABLE `saved_jobs` (
  `id`              BIGINT         NOT NULL AUTO_INCREMENT,
  `user_id`         INT            NOT NULL,
  `job_id`          INT            DEFAULT NULL,
  `external_job_id` VARCHAR(255)   DEFAULT NULL,
  `source`          VARCHAR(100)   DEFAULT NULL,
  `title`           VARCHAR(255)   DEFAULT NULL,
  `company`         VARCHAR(255)   DEFAULT NULL,
  `company_logo`    TEXT           DEFAULT NULL,
  `location`        VARCHAR(255)   DEFAULT NULL,
  `salary`          VARCHAR(255)   DEFAULT NULL,
  `employment_type` VARCHAR(100)   DEFAULT NULL,
  `apply_url`       TEXT           DEFAULT NULL,
  `posted_date`     VARCHAR(50)    DEFAULT NULL,
  `saved_at`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_saved_jobs_user_ext` (`user_id`, `external_job_id`),
  KEY `idx_saved_jobs_user` (`user_id`),
  CONSTRAINT `fk_saved_jobs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── SAVED COMPANIES ───────────────────────────────────────────────────────────
-- model: savedCompany.model.js
-- timestamps: true  underscored: true  →  created_at + updated_at
-- No FK to companies table — inline snapshot stored at save time
CREATE TABLE `saved_companies` (
  `id`                  INT            NOT NULL AUTO_INCREMENT,
  `user_id`             INT            NOT NULL,
  `company_id`          INT            DEFAULT NULL,
  `external_company_id` VARCHAR(255)   DEFAULT NULL,
  `source`              VARCHAR(100)   DEFAULT NULL,
  `company_name`        VARCHAR(255)   DEFAULT NULL,
  `logo`                TEXT           DEFAULT NULL,
  `website`             TEXT           DEFAULT NULL,
  `address`             TEXT           DEFAULT NULL,
  `phone`               VARCHAR(50)    DEFAULT NULL,
  `rating`              FLOAT          DEFAULT NULL,
  `maps_url`            TEXT           DEFAULT NULL,
  `career_page`         TEXT           DEFAULT NULL,
  `industry`            VARCHAR(100)   DEFAULT NULL,
  `city`                VARCHAR(100)   DEFAULT NULL,
  `created_at`          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_saved_companies_user_ext` (`user_id`, `external_company_id`),
  KEY `idx_saved_companies_user` (`user_id`),
  CONSTRAINT `fk_saved_companies_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── ROADMAPS ──────────────────────────────────────────────────────────────────
-- model: roadmap.model.js
-- timestamps: false  (created_at managed manually)
CREATE TABLE `roadmaps` (
  `id`              INT            NOT NULL AUTO_INCREMENT,
  `user_id`         INT            NOT NULL,
  `title`           VARCHAR(255)   DEFAULT NULL,
  `target_role`     VARCHAR(100)   DEFAULT NULL,
  `roadmap_content` TEXT           DEFAULT NULL,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_roadmaps_user` (`user_id`),
  CONSTRAINT `fk_roadmaps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── INTERVIEW SESSIONS ────────────────────────────────────────────────────────
-- model: interviewSession.model.js
-- timestamps: false  underscored: true
-- IMPORTANT: Sequelize maps createdAt field → `started_at` column (not created_at)
CREATE TABLE `interview_sessions` (
  `id`                 INT            NOT NULL AUTO_INCREMENT,
  `user_id`            INT            NOT NULL,
  `role`               VARCHAR(255)   NOT NULL,
  `difficulty`         VARCHAR(255)   NOT NULL,
  `status`             VARCHAR(50)    DEFAULT 'active',
  `total_questions`    INT            DEFAULT 0,
  `answered_questions` INT            DEFAULT 0,
  `overall_score`      FLOAT          DEFAULT 0,
  `report`             TEXT           DEFAULT NULL,
  `started_at`         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_interview_sessions_user` (`user_id`),
  CONSTRAINT `fk_interview_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── INTERVIEW QUESTIONS ───────────────────────────────────────────────────────
-- model: interviewQuestion.model.js
-- timestamps: true  underscored: true  →  created_at + updated_at
CREATE TABLE `interview_questions` (
  `id`              INT            NOT NULL AUTO_INCREMENT,
  `session_id`      INT            NOT NULL,
  `question_number` INT            NOT NULL,
  `category`        VARCHAR(255)   DEFAULT 'technical',
  `question`        TEXT           NOT NULL,
  `user_answer`     TEXT           DEFAULT NULL,
  `feedback`        TEXT           DEFAULT NULL,
  `score`           FLOAT          DEFAULT NULL,
  `skipped`         TINYINT(1)     DEFAULT 0,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_interview_questions_session` (`session_id`),
  CONSTRAINT `fk_interview_questions_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── CHATS ─────────────────────────────────────────────────────────────────────
-- model: chat.model.js
-- timestamps: true  →  createdAt / updatedAt  (Sequelize default)
CREATE TABLE `chats` (
  `id`        INT      NOT NULL AUTO_INCREMENT,
  `userId`    INT      NOT NULL,
  `message`   TEXT     DEFAULT NULL,
  `response`  TEXT     DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chats_user` (`userId`),
  CONSTRAINT `fk_chats_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
