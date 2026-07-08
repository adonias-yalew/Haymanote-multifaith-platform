-- Disable email verification gate and auto-approve role accounts.
-- New and existing users should be able to log in immediately.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;

ALTER TABLE users
ALTER COLUMN email_verified SET DEFAULT TRUE;

UPDATE users
SET email_verified = TRUE
WHERE email_verified IS DISTINCT FROM TRUE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'APPROVED';

UPDATE users
SET verification_status = 'APPROVED'
WHERE verification_status IS NULL
   OR verification_status <> 'APPROVED';

ALTER TABLE users
ALTER COLUMN verification_status SET DEFAULT 'APPROVED';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'ACTIVE';

UPDATE users
SET account_status = 'ACTIVE'
WHERE account_status IS NULL
   OR account_status <> 'ACTIVE';

ALTER TABLE users
ALTER COLUMN account_status SET DEFAULT 'ACTIVE';

UPDATE leader_profiles
SET status = 'VERIFIED'
WHERE status IS NULL
   OR status <> 'VERIFIED';

UPDATE vendor_profiles
SET status = 'VERIFIED'
WHERE status IS NULL
   OR status <> 'VERIFIED';

UPDATE verification_requests
SET
    status = 'APPROVED',
    reviewed_at = COALESCE(reviewed_at, NOW())
WHERE status IS NULL
   OR status <> 'APPROVED';

DO $$
BEGIN
    IF to_regclass('auth.users') IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'auth'
              AND table_name = 'users'
              AND column_name = 'email_confirmed_at'
        ) THEN
            EXECUTE 'UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) WHERE email_confirmed_at IS NULL';
        END IF;
    END IF;
END $$;
