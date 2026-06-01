-- Migration: Add soft delete support to all tables
-- Created at: 2024-01-01T00:00:00Z

ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE courses ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE exams ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE grades ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Create indexes for soft deletes
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_courses_deleted_at ON courses(deleted_at);
CREATE INDEX idx_exams_deleted_at ON exams(deleted_at);
CREATE INDEX idx_grades_deleted_at ON grades(deleted_at);

-- Audit table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL,
  user_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
