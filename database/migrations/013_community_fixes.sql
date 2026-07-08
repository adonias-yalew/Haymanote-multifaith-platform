-- ============================================
-- COMMUNITY & Q&A FIXES
-- ============================================

-- 1. Ensure required columns exist for leader responses, comments, and image uploads
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS leader_responses_count INTEGER DEFAULT 0;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_leader_response BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. CREATE REPORTS TABLE (if it was accidentally dropped or missing)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'USER', 'BLOG')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('HARASSMENT', 'HATE_SPEECH', 'MISINFORMATION', 'SPAM', 'SELF_HARM', 'OTHER')),
    description TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
    reviewed_by UUID REFERENCES users(id),
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. ADD INDEXES & TRIGGERS FOR REPORTS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reports_updated_at') THEN
        CREATE TRIGGER update_reports_updated_at
        BEFORE UPDATE ON reports
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- 4. ENABLE RLS AND CREATE POLICIES FOR REPORTS
-- ============================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own reports') THEN
        CREATE POLICY "Users can view own reports" 
        ON reports FOR SELECT 
        TO authenticated 
        USING (reporter_id = auth.uid()::uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports') THEN
        CREATE POLICY "Users can create reports" 
        ON reports FOR INSERT 
        TO authenticated 
        WITH CHECK (reporter_id = auth.uid()::uuid);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all reports') THEN
        CREATE POLICY "Admins can manage all reports" 
        ON reports FOR ALL 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid()::uuid AND role = 'ADMIN'
            )
        );
    END IF;
END $$;

-- ============================================
-- 5. RELOAD POSTGREST SCHEMA CACHE
-- ============================================
-- This fixes the "Could not find the table 'public.reports' in the schema cache" error
NOTIFY pgrst, 'reload schema';
