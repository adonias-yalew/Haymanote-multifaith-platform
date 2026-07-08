-- Addis Tesfa Platform - Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view all users" 
ON users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = id::text);

-- Admins can manage all users
CREATE POLICY "Admins can manage users" 
ON users FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- POSTS TABLE POLICIES
-- ============================================
-- Everyone can view published posts
CREATE POLICY "Anyone can view published posts" 
ON posts FOR SELECT 
TO authenticated 
USING (status = 'PUBLISHED');

-- Authors can view their own posts
CREATE POLICY "Authors can view own posts" 
ON posts FOR SELECT 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Admins can view all posts
CREATE POLICY "Admins can view all posts" 
ON posts FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" 
ON posts FOR INSERT 
TO authenticated 
WITH CHECK (author_id = auth.uid()::uuid);

-- Authors can update own posts
CREATE POLICY "Authors can update own posts" 
ON posts FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Authors can delete own posts
CREATE POLICY "Authors can delete own posts" 
ON posts FOR DELETE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Admins can manage all posts
CREATE POLICY "Admins can manage all posts" 
ON posts FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view comments" 
ON comments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON comments FOR INSERT 
TO authenticated 
WITH CHECK (author_id = auth.uid()::uuid);

CREATE POLICY "Authors can update own comments" 
ON comments FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

CREATE POLICY "Authors can delete own comments" 
ON comments FOR DELETE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

CREATE POLICY "Admins can manage all comments" 
ON comments FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- POST LIKES TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view post likes" 
ON post_likes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can like/unlike posts" 
ON post_likes FOR ALL 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- ============================================
-- COMMENT LIKES TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view comment likes" 
ON comment_likes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can like/unlike comments" 
ON comment_likes FOR ALL 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- ============================================
-- PROFESSIONAL PROFILES TABLE POLICIES
-- ============================================
-- Everyone can view verified professionals
CREATE POLICY "Anyone can view verified professionals" 
ON professional_profiles FOR SELECT 
TO authenticated 
USING (status = 'VERIFIED');

-- Users can view own profile
CREATE POLICY "Users can view own profile" 
ON professional_profiles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- Users can create own professional profile
CREATE POLICY "Users can create own profile" 
ON professional_profiles FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid()::uuid);

-- Admins can view and manage all profiles
CREATE POLICY "Admins can manage all profiles" 
ON professional_profiles FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- PROFESSIONAL RESPONSES TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view professional responses" 
ON professional_responses FOR SELECT 
TO authenticated 
USING (true);

-- Only verified professionals can create responses
CREATE POLICY "Verified professionals can create responses" 
ON professional_responses FOR INSERT 
TO authenticated 
WITH CHECK (
    professional_id = auth.uid()::uuid AND
    EXISTS (
        SELECT 1 FROM professional_profiles 
        WHERE user_id = auth.uid()::uuid AND status = 'VERIFIED'
    )
);

-- Professionals can update own responses
CREATE POLICY "Professionals can update own responses" 
ON professional_responses FOR UPDATE 
TO authenticated 
USING (professional_id = auth.uid()::uuid);

-- Professionals can delete own responses
CREATE POLICY "Professionals can delete own responses" 
ON professional_responses FOR DELETE 
TO authenticated 
USING (professional_id = auth.uid()::uuid);

-- Admins can manage all responses
CREATE POLICY "Admins can manage all responses" 
ON professional_responses FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- BLOGS TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view published blogs" 
ON blogs FOR SELECT 
TO authenticated 
USING (published = true);

-- Authors can view own blogs
CREATE POLICY "Authors can view own blogs" 
ON blogs FOR SELECT 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Verified professionals/admins can create blogs
CREATE POLICY "Verified professionals can create blogs" 
ON blogs FOR INSERT 
TO authenticated 
WITH CHECK (
    author_id = auth.uid()::uuid AND
    EXISTS (
        SELECT 1 FROM users u
        LEFT JOIN professional_profiles p ON u.id = p.user_id
        WHERE u.id = auth.uid()::uuid 
        AND (u.role = 'ADMIN' OR (u.role = 'PROFESSIONAL' AND p.status = 'VERIFIED'))
    )
);

-- Authors can update own blogs
CREATE POLICY "Authors can update own blogs" 
ON blogs FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Authors can delete own blogs
CREATE POLICY "Authors can delete own blogs" 
ON blogs FOR DELETE 
TO authenticated 
USING (author_id = auth.uid()::uuid);

-- Admins can manage all blogs
CREATE POLICY "Admins can manage all blogs" 
ON blogs FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- BLOG LIKES TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view blog likes" 
ON blog_likes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can like/unlike blogs" 
ON blog_likes FOR ALL 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view own reports" 
ON reports FOR SELECT 
TO authenticated 
USING (reporter_id = auth.uid()::uuid);

CREATE POLICY "Users can create reports" 
ON reports FOR INSERT 
TO authenticated 
WITH CHECK (reporter_id = auth.uid()::uuid);

-- Admins can view and manage all reports
CREATE POLICY "Admins can manage all reports" 
ON reports FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid AND role = 'ADMIN'
    )
);

-- ============================================
-- SAVED CONTENT TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view own saved content" 
ON saved_content FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can save content" 
ON saved_content FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can unsave content" 
ON saved_content FOR DELETE 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- ============================================
-- USER REPUTATION HISTORY TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view own reputation history" 
ON user_reputation_history FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::uuid);

-- System can insert reputation history
CREATE POLICY "System can insert reputation" 
ON user_reputation_history FOR INSERT 
TO authenticated 
WITH CHECK (true);
