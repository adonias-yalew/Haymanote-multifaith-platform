    -- Fix: Add is_anonymous column to users table if missing
    -- Run this in Supabase SQL Editor

    -- Add is_anonymous column if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'is_anonymous'
        ) THEN
            ALTER TABLE users ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
        END IF;
    END $$;

    -- Add password_hash column if it doesn't exist (for the auth system)
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'password_hash'
        ) THEN
            ALTER TABLE users ADD COLUMN password_hash TEXT;
        END IF;
    END $$;

    -- Add other missing columns from initial schema
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role'
        ) THEN
            ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER';
        END IF;
    END $$;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'display_name'
        ) THEN
            ALTER TABLE users ADD COLUMN display_name TEXT;
        END IF;
    END $$;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'bio'
        ) THEN
            ALTER TABLE users ADD COLUMN bio TEXT;
        END IF;
    END $$;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'avatar_url'
        ) THEN
            ALTER TABLE users ADD COLUMN avatar_url TEXT;
        END IF;
    END $$;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'reputation_score'
        ) THEN
            ALTER TABLE users ADD COLUMN reputation_score INTEGER DEFAULT 0;
        END IF;
    END $$;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'helpfulness_badge'
        ) THEN
            ALTER TABLE users ADD COLUMN helpfulness_badge TEXT DEFAULT 'NONE';
        END IF;
    END $$;

    -- Add updated_at column if missing
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END $$;

    -- Add created_at column if missing
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'created_at'
        ) THEN
            ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END $$;

    -- Verify columns
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position;
