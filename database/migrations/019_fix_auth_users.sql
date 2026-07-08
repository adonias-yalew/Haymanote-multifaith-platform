-- 019_fix_auth_users.sql
-- ⚠️ NOTE: Direct SQL INSERT into auth.users is unreliable across Supabase versions
-- (triggers, constraints, GoTrue email validation blocks @example.com domains).
--
-- RECOMMENDED: Run the Node.js script instead:
--   cd backend && npx tsx scripts/createMockAuthUsers.ts
--
-- That script uses supabase.auth.admin.createUser() (the same API the register
-- endpoint uses), which is the most reliable method. It also syncs public.users
-- emails to use @mail.haymanote.com (since GoTrue blocks @example.com).
--
-- --- SQL fallback (may not work on all Supabase versions) ---

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove any existing auth entries for mock users (clean slate)
DELETE FROM auth.identities WHERE user_id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
);
DELETE FROM auth.users WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
);

-- Insert auth.users with all known columns explicitly set
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user,
    created_at, updated_at, role, aud
)
SELECT
    id, '00000000-0000-0000-0000-000000000000', email,
    crypt('Pass@123!', gen_salt('bf', 10)),
    NOW(), NOW(),
    NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('religion', religion, 'role', role, 'organizationName', organization_name),
    FALSE, FALSE,
    NOW(), NOW(), 'authenticated', 'authenticated'
FROM public.users
WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
);

-- Insert auth.identities (required for email/password login)
INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
)
SELECT
    id, id,
    jsonb_build_object('sub', id::text, 'email', email),
    'email', email, NOW(), NOW(), NOW()
FROM public.users
WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
);

NOTIFY pgrst, 'reload schema';
