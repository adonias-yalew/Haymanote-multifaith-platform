-- Phase 1: Email Verification and New Features Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- ALTER USERS TABLE - Add email verification & social auth
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULLABLE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULLABLE UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULLABLE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations TEXT NULLABLE; -- For leaders
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER NULLABLE; -- For leaders

-- ============================================
-- PRAYER_TRACKER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_name TEXT NOT NULL,
    religion TEXT NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_prayer_tracker_user_id ON prayer_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_tracker_completed_date ON prayer_tracker(completed_date);

-- ============================================
-- PRAYER_STREAKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_id UUID NOT NULL REFERENCES prayer_tracker(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_prayer_streaks_user_id ON prayer_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_streaks_prayer_id ON prayer_streaks(prayer_id);

-- ============================================
-- DONATION_RECIPIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donation_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    religion TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    bank_account VARCHAR(50) NULLABLE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for religion lookups
CREATE INDEX IF NOT EXISTS idx_donation_recipients_religion ON donation_recipients(religion);

-- ============================================
-- DONATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES donation_recipients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255) NULLABLE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_recipient_id ON donations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- ============================================
-- EMAIL_VERIFICATION_TOKENS TABLE (for tracking token expiry)
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for token lookups and expiry cleanup
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- ============================================
-- Enable RLS policies for new tables
-- ============================================
ALTER TABLE prayer_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Prayer Tracker
-- ============================================
CREATE POLICY "Users can view their own prayer tracker" ON prayer_tracker
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert prayer tracker" ON prayer_tracker
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own prayer tracker" ON prayer_tracker
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own prayer tracker" ON prayer_tracker
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================
-- RLS Policies - Prayer Streaks
-- ============================================
CREATE POLICY "Users can view their own prayer streaks" ON prayer_streaks
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert prayer streaks" ON prayer_streaks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own prayer streaks" ON prayer_streaks
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- ============================================
-- RLS Policies - Donation Recipients
-- ============================================
CREATE POLICY "Anyone can view donation recipients" ON donation_recipients
    FOR SELECT USING (true);

-- ============================================
-- RLS Policies - Donations
-- ============================================
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert donations" ON donations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all donations" ON donations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN')
    );

-- ============================================
-- RLS Policies - Email Verification Tokens
-- ============================================
CREATE POLICY "Users can view their own verification tokens" ON email_verification_tokens
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert verification tokens" ON email_verification_tokens
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
