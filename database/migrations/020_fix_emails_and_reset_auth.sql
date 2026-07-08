-- 020_fix_emails_and_reset_auth.sql
-- Fixes two blocking issues from earlier migrations:
--   1. @example.com is rejected by Supabase GoTrue (RFC 2606 reserved domain)
--   2. Direct SQL insert into auth.users is unreliable — we re-create them here
--      using explicit column list + crypt(), then recommend the Node.js script
--      if this still doesn't work on your Supabase version.
--
-- Run after all previous migrations (001–019).
-- Password for all mock users: Pass@123!

-- ============================================
-- PART 1: Fix emails in public.users
-- ============================================

-- Use a DO block so that any unique-constraint hit on a particular email
-- does not abort the whole migration.  (The conflict can happen when a
-- previous partial run already created the target email on a different row.)
DO $$
DECLARE
    rows_affected INT;
BEGIN
    -- 017 mock users (canonical UUIDs) — each wrapped in its own sub-block
    -- so a unique-violation on one email doesn't roll back the others.

    BEGIN
        UPDATE users SET email = 'dawit.hailu@mail.haymanote.com' WHERE id = 'a0000000-0000-0000-0000-000000000001' AND email != 'dawit.hailu@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'dawit.hailu: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'dawit.hailu: skipped (target email exists on another row)'; END;

    BEGIN
        UPDATE users SET email = 'abune.germame@mail.haymanote.com' WHERE id = 'a0000000-0000-0000-0000-000000000002' AND email != 'abune.germame@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'abune.germame: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'abune.germame: skipped'; END;

    BEGIN
        UPDATE users SET email = 'kidus.maket@mail.haymanote.com' WHERE id = 'a0000000-0000-0000-0000-000000000003' AND email != 'kidus.maket@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'kidus.maket: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'kidus.maket: skipped'; END;

    BEGIN
        UPDATE users SET email = 'amina.hassan@mail.haymanote.com' WHERE id = 'b0000000-0000-0000-0000-000000000001' AND email != 'amina.hassan@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'amina.hassan: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'amina.hassan: skipped'; END;

    BEGIN
        UPDATE users SET email = 'sheikh.ahmed@mail.haymanote.com' WHERE id = 'b0000000-0000-0000-0000-000000000002' AND email != 'sheikh.ahmed@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'sheikh.ahmed: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'sheikh.ahmed: skipped'; END;

    BEGIN
        UPDATE users SET email = 'halal.goods@mail.haymanote.com' WHERE id = 'b0000000-0000-0000-0000-000000000003' AND email != 'halal.goods@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'halal.goods: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'halal.goods: skipped'; END;

    BEGIN
        UPDATE users SET email = 'sara.tadesse@mail.haymanote.com' WHERE id = 'c0000000-0000-0000-0000-000000000001' AND email != 'sara.tadesse@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'sara.tadesse: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'sara.tadesse: skipped'; END;

    BEGIN
        UPDATE users SET email = 'pastor.markos@mail.haymanote.com' WHERE id = 'c0000000-0000-0000-0000-000000000002' AND email != 'pastor.markos@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'pastor.markos: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'pastor.markos: skipped'; END;

    BEGIN
        UPDATE users SET email = 'grace.books@mail.haymanote.com' WHERE id = 'c0000000-0000-0000-0000-000000000003' AND email != 'grace.books@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'grace.books: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'grace.books: skipped'; END;

    BEGIN
        UPDATE users SET email = 'admin@mail.haymanote.com' WHERE id = 'd0000000-0000-0000-0000-000000000001' AND email != 'admin@mail.haymanote.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'admin: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'admin: skipped'; END;

    -- Legacy / seed users (match by old email)
    BEGIN
        UPDATE users SET email = 'orthodox_member@mail.haymanote.com' WHERE email = 'orthodox_member@example.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'orthodox_member: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'orthodox_member: skipped'; END;

    BEGIN
        UPDATE users SET email = 'muslim_member@mail.haymanote.com' WHERE email = 'muslim_member@example.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'muslim_member: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'muslim_member: skipped'; END;

    BEGIN
        UPDATE users SET email = 'pastor_john@mail.haymanote.com' WHERE email = 'pastor_john@example.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'pastor_john: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'pastor_john: skipped'; END;

    BEGIN
        UPDATE users SET email = 'holy_store@mail.haymanote.com' WHERE email = 'holy_store@example.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'holy_store: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'holy_store: skipped'; END;

    BEGIN
        UPDATE users SET email = 'user@mail.haymanote.com' WHERE email = 'user@example.com';
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        IF rows_affected > 0 THEN RAISE NOTICE 'seed user: updated'; END IF;
    EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'seed user: skipped'; END;

END $$;

-- ============================================
-- PART 2: Nuke stale auth entries for mock users
-- ============================================
-- (Created by 018/019 with wrong @example.com emails that GoTrue rejects)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    mock_ids UUID[] := ARRAY[
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
    ];
    u_id UUID;
BEGIN
    -- Delete identities first (FK)
    FOREACH u_id IN ARRAY mock_ids LOOP
        DELETE FROM auth.identities WHERE user_id = u_id;
    END LOOP;

    -- Delete stale auth users
    FOREACH u_id IN ARRAY mock_ids LOOP
        DELETE FROM auth.users WHERE id = u_id;
    END LOOP;
END $$;

-- ============================================
-- PART 3: Re-create auth users with @mail.haymanote.com
-- ============================================

INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user,
    created_at, updated_at, role, aud
)
SELECT
    u.id,
    '00000000-0000-0000-0000-000000000000',
    u.email,
    crypt('Pass@123!', gen_salt('bf', 10)),
    NOW(), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('religion', u.religion, 'role', u.role, 'organizationName', u.organization_name),
    FALSE, FALSE,
    NOW(), NOW(), 'authenticated', 'authenticated'
FROM users u
WHERE u.id = ANY(ARRAY[
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'b0000000-0000-0000-0000-000000000003'::uuid,
    'c0000000-0000-0000-0000-000000000001'::uuid,
    'c0000000-0000-0000-0000-000000000002'::uuid,
    'c0000000-0000-0000-0000-000000000003'::uuid,
    'd0000000-0000-0000-0000-000000000001'::uuid
])
ON CONFLICT (id) DO NOTHING;

-- Insert identities (required for email/password login)
INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
)
SELECT
    u.id, u.id,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email', u.email, NOW(), NOW(), NOW()
FROM users u
WHERE u.id = ANY(ARRAY[
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'b0000000-0000-0000-0000-000000000003'::uuid,
    'c0000000-0000-0000-0000-000000000001'::uuid,
    'c0000000-0000-0000-0000-000000000002'::uuid,
    'c0000000-0000-0000-0000-000000000003'::uuid,
    'd0000000-0000-0000-0000-000000000001'::uuid
])
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';

-- ============================================
-- NOTE: If login still fails after this migration:
-- ============================================
-- Some Supabase versions have triggers on auth.users that silently
-- reject direct SQL inserts. If that's the case, run the Node.js script:
--
--   cd backend && npx tsx scripts/createMockAuthUsers.ts
--
-- It uses supabase.auth.admin.createUser() — the same API the register
-- flow uses — which handles triggers correctly.
