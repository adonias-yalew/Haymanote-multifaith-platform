-- Fix Posts Table and Add Mock Data

-- 1. Ensure posts table exists and has the correct schema (if you didn't run 001)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    leader_responses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fix the "posts.status does not exist" error
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'HIDDEN', 'UNDER_REVIEW'));

-- 3. Ensure comments table exists
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    is_helpful BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS on posts and comments
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (status = 'PUBLISHED');

DROP POLICY IF EXISTS "Authors can manage their posts" ON posts;
CREATE POLICY "Authors can manage their posts" ON posts FOR ALL USING (author_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (TRUE);


-- ============================================
-- MOCK DATA GENERATION
-- Note: Replace the user IDs with actual UUIDs if you need them to link to real Supabase Auth users.
-- For local testing, these random UUIDs will display correctly in the frontend.
-- ============================================

DO $$
DECLARE
    orthodox_user_id UUID := uuid_generate_v4();
    muslim_user_id UUID := uuid_generate_v4();
    leader_user_id UUID := uuid_generate_v4();
    vendor_user_id UUID := uuid_generate_v4();
    post1_id UUID := uuid_generate_v4();
    post2_id UUID := uuid_generate_v4();
    sermon1_id UUID := uuid_generate_v4();
BEGIN

    -- 1. Create Mock Users
    INSERT INTO users (id, email, display_name, role, religion, organization_name) VALUES
    (orthodox_user_id, 'orthodox_member@mail.haymanote.com', 'Abebe Bekele', 'user', 'orthodox', NULL),
    (muslim_user_id, 'muslim_member@mail.haymanote.com', 'Fatima Mohammed', 'user', 'muslim', NULL),
    (leader_user_id, 'pastor_john@mail.haymanote.com', 'Pastor John', 'leader', 'protestant', NULL),
    (vendor_user_id, 'holy_store@mail.haymanote.com', 'Holy Store Admin', 'vendor', 'orthodox', 'Holy Store LLC');

    -- 2. Create Mock Leader Profile
    INSERT INTO leader_profiles (user_id, bio, status, verification_document_url) VALUES
    (leader_user_id, 'Serving the community for 15 years.', 'VERIFIED', 'http://example.com/doc.pdf');

    -- 3. Create Mock Vendor Profile
    INSERT INTO vendor_profiles (user_id, organization_name, status) VALUES
    (vendor_user_id, 'Holy Store LLC', 'VERIFIED');

    -- 4. Create Mock Posts (Community Q&A / Stories)
    INSERT INTO posts (id, author_id, title, content, status, tags) VALUES
    (post1_id, orthodox_user_id, 'Finding peace during fasting', 'The current fasting season has been incredibly spiritual for me. How do others maintain their energy?', 'PUBLISHED', ARRAY['fasting', 'peace']),
    (post2_id, muslim_user_id, 'Question about daily prayers', 'I have a question regarding the timing of prayers during travel. Can someone advise?', 'PUBLISHED', ARRAY['prayer', 'travel']);

    -- 5. Create Mock Comments
    INSERT INTO comments (post_id, author_id, content) VALUES
    (post1_id, muslim_user_id, 'I find that staying hydrated before sunrise helps immensely!'),
    (post2_id, leader_user_id, 'As a traveler, there are specific exemptions you can follow based on distance.');

    -- 6. Create Mock Sermons/Teachings
    INSERT INTO sermons (id, author_id, title, content, published) VALUES
    (sermon1_id, leader_user_id, 'The Power of Forgiveness', 'Forgiveness is not just for others, it is for your own peace...', TRUE);

    -- 7. Create Mock Prayers
    INSERT INTO prayers (user_id, title, description, is_public) VALUES
    (orthodox_user_id, 'Prayer for my family', 'Please pray for my mother''s spiritual strength.', TRUE),
    (muslim_user_id, 'Guidance in my career', 'Seeking the right path for my new job.', FALSE);

    -- 8. Create Mock Products
    INSERT INTO products (vendor_id, title, description, price, category, stock) VALUES
    (vendor_user_id, 'Handmade Cross Necklace', 'Beautiful wooden cross made by local artisans.', 25.00, 'Accessories', 50),
    (vendor_user_id, 'Spiritual Book Set', 'A collection of foundational teachings.', 45.00, 'Books', 20);

END $$;
