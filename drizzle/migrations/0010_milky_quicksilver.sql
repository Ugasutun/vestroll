-- Migration: Add created_at index to login_attempts for efficient log rotation
-- Created: 2026-03-26

ALTER TABLE login_attempts ADD INDEX login_attempts_created_at_idx (created_at);