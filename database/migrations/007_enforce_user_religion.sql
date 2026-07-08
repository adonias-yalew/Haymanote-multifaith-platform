-- Migration: Enforce User Religion NOT NULL
-- This migration ensures that the religion column on the users table cannot be NULL.

-- 1. Backfill any existing users that have NULL religion with 'orthodox'
UPDATE users SET religion = 'orthodox' WHERE religion IS NULL;

-- 2. Enforce NOT NULL constraint
ALTER TABLE users ALTER COLUMN religion SET NOT NULL;
