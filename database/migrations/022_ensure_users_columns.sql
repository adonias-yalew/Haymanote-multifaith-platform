-- 022_ensure_users_columns.sql
-- Migration 002_add_is_anonymous.sql ran before 003_haymanote_migration.sql
-- which recreated the users table without the is_anonymous column.
-- This migration ensures all missing columns exist.

-- Add is_anonymous column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add bio column if missing (also from 002 but potentially lost)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add password_hash column if missing (from 002)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add updated_at column if missing (from 002)
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add religion column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS religion TEXT;

-- Add organization_name column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name TEXT;

-- Add email_verified column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add verification_status column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING'::text;

-- Add account_status column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'ACTIVE'::text;

-- Update existing users to have is_anonymous = false where NULL
UPDATE users SET is_anonymous = FALSE WHERE is_anonymous IS NULL;

NOTIFY pgrst, 'reload schema';
