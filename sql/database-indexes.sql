-- Performance Optimization: Add database indexes for userId queries
-- Run this SQL in Supabase SQL Editor
-- IMPORTANT: Use quotes around camelCase column names in PostgreSQL

-- Add index on notes.userId for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes("userId");

-- Add index on tags.userId for faster user-specific tag queries
CREATE INDEX IF NOT EXISTS idx_tags_userId ON tags("userId");

-- Composite index for common query pattern: notes by userId and date
CREATE INDEX IF NOT EXISTS idx_notes_userId_date ON notes("userId", date);

-- Composite index for common query pattern: notes by userId, sorted by creation date
CREATE INDEX IF NOT EXISTS idx_notes_userId_createdAt ON notes("userId", "createdAt" DESC);

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('notes', 'tags')
ORDER BY tablename, indexname;
