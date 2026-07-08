-- Admin management reconciliation
-- Use this after an older 014 admin migration has already been applied.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'ACTIVE';

UPDATE users
SET account_status = 'ACTIVE'
WHERE account_status IS NULL;

UPDATE users
SET account_status = 'SUSPENDED'
WHERE account_status NOT IN ('ACTIVE', 'SUSPENDED');

ALTER TABLE users
ALTER COLUMN account_status SET DEFAULT 'ACTIVE';

ALTER TABLE users
ALTER COLUMN account_status SET NOT NULL;

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'users'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%account_status%'
    LOOP
        EXECUTE format('ALTER TABLE users DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
    END LOOP;
END $$;

ALTER TABLE users
ADD CONSTRAINT users_account_status_check
CHECK (account_status IN ('ACTIVE', 'SUSPENDED'));

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_religion ON users(religion);

CREATE TABLE IF NOT EXISTS religion_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE CHECK (slug IN ('orthodox', 'muslim', 'protestant')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO religion_categories (name, slug, description)
VALUES
    ('Orthodox', 'orthodox', 'Orthodox Christian community content and marketplace taxonomy.'),
    ('Muslim', 'muslim', 'Muslim community content and marketplace taxonomy.'),
    ('Protestant', 'protestant', 'Protestant Christian community content and marketplace taxonomy.')
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO system_settings (key, value, description)
VALUES
    ('moderation.require_post_review', 'false'::jsonb, 'Require admin review before community posts are visible.'),
    ('verification.auto_approve_vendors', 'false'::jsonb, 'Automatically approve vendor verification requests.'),
    ('marketplace.allow_out_of_stock_listing', 'false'::jsonb, 'Allow products with zero stock to remain listed.')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_religion_categories_updated_at ON religion_categories;
CREATE TRIGGER update_religion_categories_updated_at
BEFORE UPDATE ON religion_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_system_settings_updated_at();

ALTER TABLE religion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users view religion categories" ON religion_categories;
CREATE POLICY "Authenticated users view religion categories"
ON religion_categories FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "Admins manage religion categories" ON religion_categories;
CREATE POLICY "Admins manage religion categories"
ON religion_categories FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins manage system settings" ON system_settings;
CREATE POLICY "Admins manage system settings"
ON system_settings FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin')
);
