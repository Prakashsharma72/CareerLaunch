-- Additive roadmap feature migration for existing MySQL installations.
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS short_description VARCHAR(500) NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS difficulty VARCHAR(32) NOT NULL DEFAULT 'Beginner';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS duration_weeks INT NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS cover_url TEXT NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS pdf_url TEXT NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS pdf_name VARCHAR(255) NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS published_at DATETIME NULL;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS roadmap_steps (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, roadmap_id INT NOT NULL, title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL, topics TEXT NULL, estimated_time VARCHAR(100) NULL, practice_task TEXT NULL,
  step_order INT NOT NULL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_roadmap_steps_roadmap (roadmap_id)
);
CREATE TABLE IF NOT EXISTS roadmap_resources (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, step_id INT NOT NULL, label VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'Article', source_type VARCHAR(16) NOT NULL DEFAULT 'link', url TEXT NOT NULL,
  storage_public_id VARCHAR(500) NULL, original_name VARCHAR(255) NULL, mime_type VARCHAR(150) NULL,
  file_size BIGINT NULL, resource_type VARCHAR(16) NULL, resource_order INT NOT NULL DEFAULT 0,
  KEY idx_roadmap_resources_step (step_id)
);
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, roadmap_id INT NOT NULL, step_id INT NOT NULL,
  completed_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roadmap_progress (user_id, roadmap_id, step_id)
);