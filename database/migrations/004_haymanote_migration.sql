-- Migration: Add Religion, Organization, Documents, and fix Roles for Haymanote

-- 1. Fix the users role constraint to use lowercase values to match the application code
-- First drop the old constraint so we can update the existing uppercase roles to lowercase
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Now safely convert existing users to lowercase
UPDATE users SET role = 'user' WHERE role = 'MEMBER';
UPDATE users SET role = 'leader' WHERE role = 'LEADER';
UPDATE users SET role = 'vendor' WHERE role = 'VENDOR';
UPDATE users SET role = 'admin' WHERE role = 'ADMIN';

-- Add the new constraint and default
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'leader', 'vendor', 'admin'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- 2. Add Religion and Organization to Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS religion TEXT CHECK (religion IN ('orthodox', 'muslim', 'protestant'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name TEXT;

-- 3. Add Verification Document URL to Leader Profiles
ALTER TABLE leader_profiles ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

-- 4. Create a Vendor Profiles Table to track vendor specifics
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    verification_document_url TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure updated_at triggers on vendor_profiles
DROP TRIGGER IF EXISTS update_vendor_profiles_updated_at ON vendor_profiles;
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON vendor_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS for Vendor Profiles
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view verified vendor profiles" ON vendor_profiles;
CREATE POLICY "Anyone can view verified vendor profiles" ON vendor_profiles
    FOR SELECT TO authenticated USING (status = 'VERIFIED');

DROP POLICY IF EXISTS "Vendors can view own profile" ON vendor_profiles;
CREATE POLICY "Vendors can view own profile" ON vendor_profiles
    FOR SELECT TO authenticated USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Vendors can create own profile" ON vendor_profiles;
CREATE POLICY "Vendors can create own profile" ON vendor_profiles
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::uuid);
