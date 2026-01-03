-- Migration: Assign Existing Notes to User
-- Run this in Supabase SQL Editor after creating your account
-- Replace YOUR_USER_ID with your actual user ID from Authentication → Users

-- IMPORTANT: Replace this with your actual user ID!
-- Get it from: Supabase Dashboard → Authentication → Users → Copy the UID
DO $$
DECLARE
    target_user_id UUID := '21ea9c21-b50e-40fd-ae72-b2459cf59099'::UUID;
    notes_updated INTEGER;
    tags_updated INTEGER;
BEGIN
    -- Update all notes without a userId
    UPDATE notes
    SET "userId" = target_user_id
    WHERE "userId" IS NULL;

    GET DIAGNOSTICS notes_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % notes', notes_updated;

    -- Update all tags without a userId
    UPDATE tags
    SET "userId" = target_user_id
    WHERE "userId" IS NULL;

    GET DIAGNOSTICS tags_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % tags', tags_updated;

    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Verify the migration
SELECT
    (SELECT COUNT(*) FROM notes WHERE "userId" IS NULL) as orphaned_notes,
    (SELECT COUNT(*) FROM notes WHERE "userId" = '21ea9c21-b50e-40fd-ae72-b2459cf59099'::UUID) as user_notes,
    (SELECT COUNT(*) FROM tags WHERE "userId" IS NULL) as orphaned_tags,
    (SELECT COUNT(*) FROM tags WHERE "userId" = '21ea9c21-b50e-40fd-ae72-b2459cf59099'::UUID) as user_tags;
