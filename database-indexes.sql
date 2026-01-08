-- Performance Optimization: Add userId columns and indexes
-- Run this SQL in Supabase SQL Editor

-- Step 1: Add userId column to notes table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'userid'
  ) THEN
    ALTER TABLE notes ADD COLUMN "userId" TEXT;
    COMMENT ON COLUMN notes."userId" IS 'Foreign key to auth.users';
  END IF;
END $$;

-- Step 2: Add userId column to tags table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'userid'
  ) THEN
    ALTER TABLE tags ADD COLUMN "userId" TEXT;
    COMMENT ON COLUMN tags."userId" IS 'Foreign key to auth.users';
  END IF;
END $$;

-- Step 3: Add indexes on userId for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes("userId");
CREATE INDEX IF NOT EXISTS idx_tags_userId ON tags("userId");

-- Step 4: Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_notes_userId_date ON notes("userId", date);
CREATE INDEX IF NOT EXISTS idx_notes_userId_createdAt ON notes("userId", "createdAt" DESC);

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('notes', 'tags')
ORDER BY tablename, indexname;
