-- Migration: Add pagination support indexes
-- Created at: 2024-01-02T00:00:00Z

-- Optimize list queries for pagination
CREATE INDEX idx_courses_user_id_created_at ON courses(user_id, created_at DESC);
CREATE INDEX idx_exams_course_id_created_at ON exams(course_id, created_at DESC);
CREATE INDEX idx_grades_exam_id_created_at ON grades(exam_id, created_at DESC);

-- Add row count column for efficient pagination
ALTER TABLE courses ADD COLUMN IF NOT EXISTS _count_exams INTEGER DEFAULT 0;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS _count_grades INTEGER DEFAULT 0;
