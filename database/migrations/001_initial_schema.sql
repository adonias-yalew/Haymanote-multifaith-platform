-- Addis Tesfa Platform - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'PROFESSIONAL', 'ADMIN')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 0,
    helpfulness_badge TEXT DEFAULT 'NONE' CHECK (helpfulness_badge IN ('NONE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- POSTS TABLE (Anonymous storytelling)
-- ============================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'HIDDEN', 'UNDER_REVIEW')),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    professional_responses_count INTEGER DEFAULT 0,
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
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

-- ============================================
-- POST LIKES TABLE
-- ============================================
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================
-- COMMENT LIKES TABLE
-- ============================================
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================
-- PROFESSIONAL PROFILES TABLE
-- ============================================
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    specialization TEXT NOT NULL,
    credentials TEXT NOT NULL,
    years_of_experience INTEGER NOT NULL,
    bio TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_documents TEXT[] DEFAULT '{}',
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROFESSIONAL RESPONSES TABLE
-- ============================================
CREATE TABLE professional_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_official_response BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BLOGS TABLE (Professional articles)
-- ============================================
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BLOG LIKES TABLE
-- ============================================
CREATE TABLE blog_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blog_id, user_id)
);

-- ============================================
-- REPORTS TABLE (Content moderation)
-- ============================================
CREATE TABLE reports (
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
-- SAVED CONTENT TABLE
-- ============================================
CREATE TABLE saved_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('POST', 'BLOG')),
    content_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- ============================================
-- USER REPUTATION HISTORY TABLE
-- ============================================
CREATE TABLE user_reputation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_professional_profiles_status ON professional_profiles(status);
CREATE INDEX idx_professional_profiles_user ON professional_profiles(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_saved_content_user ON saved_content(user_id);
CREATE INDEX idx_responses_post ON professional_responses(post_id);
CREATE INDEX idx_blogs_author ON blogs(author_id);
CREATE INDEX idx_blogs_published ON blogs(published);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON professional_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_responses_updated_at BEFORE UPDATE ON professional_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment post view count
CREATE OR REPLACE FUNCTION increment_post_view(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_likes AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Update comments count on posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update professional responses count
CREATE OR REPLACE FUNCTION update_post_responses_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET professional_responses_count = professional_responses_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET professional_responses_count = professional_responses_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_responses AFTER INSERT OR DELETE ON professional_responses
    FOR EACH ROW EXECUTE FUNCTION update_post_responses_count();

-- Calculate user reputation and badge
CREATE OR REPLACE FUNCTION calculate_user_reputation(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_points INTEGER;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO total_points
    FROM user_reputation_history
    WHERE user_id = user_uuid;
    
    UPDATE users 
    SET reputation_score = total_points,
        helpfulness_badge = CASE
            WHEN total_points >= 1000 THEN 'PLATINUM'
            WHEN total_points >= 500 THEN 'GOLD'
            WHEN total_points >= 200 THEN 'SILVER'
            WHEN total_points >= 50 THEN 'BRONZE'
            ELSE 'NONE'
        END
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================
CREATE INDEX idx_posts_anonymous ON posts(is_anonymous) WHERE is_anonymous = TRUE;
CREATE INDEX idx_posts_composite ON posts(status, created_at DESC);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
CREATE INDEX idx_comments_helpful ON comments(is_helpful) WHERE is_helpful = TRUE;
CREATE INDEX idx_blogs_created ON blogs(created_at DESC);
CREATE INDEX idx_blogs_tags ON blogs USING GIN(tags);
CREATE INDEX idx_professional_responses_professional ON professional_responses(professional_id);
CREATE INDEX idx_reputation_history_user ON user_reputation_history(user_id, created_at DESC);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_saved_content_type ON saved_content(content_type, content_id);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active posts with author info (for feed)
CREATE OR REPLACE VIEW v_active_posts AS
SELECT 
    p.*,
    CASE 
        WHEN p.is_anonymous THEN NULL
        ELSE u.email
    END as author_email,
    CASE 
        WHEN p.is_anonymous THEN NULL
        ELSE u.role
    END as author_role
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
WHERE p.status = 'PUBLISHED';

-- View: Verified professionals
CREATE OR REPLACE VIEW v_verified_professionals AS
SELECT 
    pp.*,
    u.email,
    u.display_name,
    u.avatar_url,
    u.reputation_score,
    u.helpfulness_badge
FROM professional_profiles pp
JOIN users u ON pp.user_id = u.id
WHERE pp.status = 'VERIFIED';

-- View: Pending reports for moderation
CREATE OR REPLACE VIEW v_pending_reports AS
SELECT 
    r.*,
    reporter.email as reporter_email
FROM reports r
JOIN users reporter ON r.reporter_id = reporter.id
WHERE r.status = 'PENDING'
ORDER BY r.created_at DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is verified professional
CREATE OR REPLACE FUNCTION is_verified_professional(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM professional_profiles
        WHERE user_id = user_uuid AND status = 'VERIFIED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_posts BIGINT,
    total_comments BIGINT,
    total_likes_received BIGINT,
    total_responses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM posts WHERE author_id = user_uuid AND status = 'PUBLISHED'),
        (SELECT COUNT(*) FROM comments WHERE author_id = user_uuid),
        (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE author_id = user_uuid),
        (SELECT COUNT(*) FROM professional_responses WHERE professional_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Soft delete post (hide instead of delete)
CREATE OR REPLACE FUNCTION soft_delete_post(post_id UUID, reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET status = 'HIDDEN', 
        moderation_reason = COALESCE(reason, 'Deleted by user')
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Record reputation event and recalculate
CREATE OR REPLACE FUNCTION record_reputation_event(
    user_uuid UUID,
    action_type TEXT,
    points INTEGER,
    reference_type TEXT DEFAULT NULL,
    reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_reputation_history (user_id, action_type, points, reference_type, reference_id)
    VALUES (user_uuid, action_type, points, reference_type, reference_id);
    
    PERFORM calculate_user_reputation(user_uuid);
END;
$$ LANGUAGE plpgsql;
