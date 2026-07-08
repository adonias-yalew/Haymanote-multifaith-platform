-- Add document verification support
-- ============================================
-- ALTER USERS TABLE - Add verification document fields
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_document_path TEXT NULLABLE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_document_name TEXT NULLABLE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_rejected_reason TEXT NULLABLE;

-- Create index for verification status lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ============================================
-- VERIFICATION_REQUESTS TABLE (for tracking admin verification)
-- ============================================
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_path TEXT NOT NULL,
    document_name TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT NULLABLE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at);

-- Enable RLS for verification_requests table
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Verification Requests
CREATE POLICY "Users can view their own verification requests" ON verification_requests
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all verification requests" ON verification_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN')
    );

CREATE POLICY "Admins can update verification requests" ON verification_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN')
    );
