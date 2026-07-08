-- Migration: Religion Access Control

-- 1. Add religion columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE comments ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE prayers ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE ai_conversations ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));

-- 2. Backfill existing records from their authors/owners
UPDATE posts SET religion = (SELECT religion FROM users WHERE users.id = posts.author_id);
UPDATE comments SET religion = (SELECT religion FROM users WHERE users.id = comments.author_id);
UPDATE sermons SET religion = (SELECT religion FROM users WHERE users.id = sermons.author_id);
UPDATE prayers SET religion = (SELECT religion FROM users WHERE users.id = prayers.user_id);
UPDATE products SET religion = (SELECT religion FROM users WHERE users.id = products.vendor_id);
UPDATE ai_conversations SET religion = (SELECT religion FROM users WHERE users.id = ai_conversations.user_id);

-- Set defaults for safety, but enforce NOT NULL
ALTER TABLE posts ALTER COLUMN religion SET NOT NULL;
ALTER TABLE comments ALTER COLUMN religion SET NOT NULL;
ALTER TABLE sermons ALTER COLUMN religion SET NOT NULL;
ALTER TABLE prayers ALTER COLUMN religion SET NOT NULL;
ALTER TABLE products ALTER COLUMN religion SET NOT NULL;
ALTER TABLE ai_conversations ALTER COLUMN religion SET NOT NULL;

-- 3. Update Row Level Security (RLS) Policies

-- Posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
CREATE POLICY "Users view own religion posts" ON posts FOR SELECT USING (
    status = 'PUBLISHED' AND (
        religion = (auth.jwt() -> 'user_metadata' ->> 'religion') OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
);

-- Comments
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Users view own religion comments" ON comments FOR SELECT USING (
    religion = (auth.jwt() -> 'user_metadata' ->> 'religion') OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Sermons
DROP POLICY IF EXISTS "View published sermons" ON sermons;
CREATE POLICY "Users view own religion sermons" ON sermons FOR SELECT USING (
    published = TRUE AND (
        religion = (auth.jwt() -> 'user_metadata' ->> 'religion') OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
);

-- Prayers
DROP POLICY IF EXISTS "Public prayers visible" ON prayers;
CREATE POLICY "Users view own religion public prayers" ON prayers FOR SELECT USING (
    is_public = TRUE AND (
        religion = (auth.jwt() -> 'user_metadata' ->> 'religion') OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
);

-- Products
DROP POLICY IF EXISTS "View products" ON products;
CREATE POLICY "Users view own religion products" ON products FOR SELECT USING (
    religion = (auth.jwt() -> 'user_metadata' ->> 'religion') OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Orders (Keep existing, buyer_id already restricts it)
-- AI Conversations (Keep existing, user_id already restricts it)

