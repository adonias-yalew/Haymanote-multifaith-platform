-- 023_fix_missing_admin_tables.sql
-- Migration 011_add_document_verification.sql had syntax errors (TEXT NULLABLE is invalid)
-- which caused the entire migration to abort, leaving verification_requests table
-- and several users columns never created. This migration creates them properly.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: Fix users table columns from failed 011
-- ============================================

-- verification_document_path was never created due to "TEXT NULLABLE" syntax error in 011
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_document_path TEXT;

-- verification_document_name was never created
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_document_name TEXT;

-- verification_status may exist from 022, but ensure it has proper type
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING'::text;

-- verification_rejected_reason was never created
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_rejected_reason TEXT;

-- Create index for verification status lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ============================================
-- PART 2: Create verification_requests table
-- ============================================
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_path TEXT NOT NULL,
    document_name TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING'::text CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
CREATE POLICY "Users can view their own verification requests" ON verification_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
CREATE POLICY "Admins can view all verification requests" ON verification_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;
CREATE POLICY "Admins can update verification requests" ON verification_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- PART 3: Ensure religion_categories exists (also may have been missed)
-- ============================================
CREATE TABLE IF NOT EXISTS religion_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE CHECK (slug IN ('orthodox', 'muslim', 'protestant')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO religion_categories (name, slug, description)
VALUES
    ('Orthodox', 'orthodox', 'Orthodox Christian community content and marketplace taxonomy.'),
    ('Muslim', 'muslim', 'Muslim community content and marketplace taxonomy.'),
    ('Protestant', 'protestant', 'Protestant Christian community content and marketplace taxonomy.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PART 4: Ensure system_settings exists
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO system_settings (key, value, description)
VALUES
    ('moderation.require_post_review', 'false'::jsonb, 'Require admin review before community posts are visible.'),
    ('verification.auto_approve_vendors', 'false'::jsonb, 'Automatically approve vendor verification requests.'),
    ('marketplace.allow_out_of_stock_listing', 'false'::jsonb, 'Allow products with zero stock to remain listed.')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PART 5: Reload PostgREST schema cache
-- ============================================
NOTIFY pgrst, 'reload schema';
