-- ============================================================================
-- COMPLETE DATABASE RESET FOR KLAT
-- ============================================================================
-- WARNING: This will DELETE ALL DATA and recreate all tables from scratch
-- Run this in Supabase SQL Editor to start with a fresh database
-- Date: 2026-01-04
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop all existing policies
-- ============================================================================

DROP POLICY IF EXISTS notes_select_policy ON notes;
DROP POLICY IF EXISTS notes_insert_policy ON notes;
DROP POLICY IF EXISTS notes_update_policy ON notes;
DROP POLICY IF EXISTS notes_delete_policy ON notes;

DROP POLICY IF EXISTS tags_select_policy ON tags;
DROP POLICY IF EXISTS tags_insert_policy ON tags;
DROP POLICY IF EXISTS tags_update_policy ON tags;
DROP POLICY IF EXISTS tags_delete_policy ON tags;

DROP POLICY IF EXISTS note_to_tag_select_policy ON "_NoteToTag";
DROP POLICY IF EXISTS note_to_tag_insert_policy ON "_NoteToTag";
DROP POLICY IF EXISTS note_to_tag_delete_policy ON "_NoteToTag";

-- ============================================================================
-- STEP 2: Drop all existing tables
-- ============================================================================

DROP TABLE IF EXISTS "_NoteToTag" CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- ============================================================================
-- STEP 3: Create notes table
-- ============================================================================

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  importance TEXT,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comment
COMMENT ON COLUMN notes.date IS 'Note date - can have multiple notes per day, sorted by createdAt';
COMMENT ON COLUMN notes.deadline IS 'Optional deadline for to-do items';
COMMENT ON COLUMN notes.importance IS 'Priority level: LOW, MEDIUM, or HIGH';

-- ============================================================================
-- STEP 4: Create tags table
-- ============================================================================

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comment
COMMENT ON COLUMN tags.color IS 'Hex color code for UI display (e.g., #EF4444)';

-- ============================================================================
-- STEP 5: Create junction table for many-to-many relationship
-- ============================================================================

CREATE TABLE "_NoteToTag" (
  "A" TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);

-- Create indexes for junction table
CREATE INDEX "_NoteToTag_B_index" ON "_NoteToTag"("B");

-- ============================================================================
-- STEP 6: Create indexes for performance
-- ============================================================================

-- Notes table indexes
CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_notes_userId ON notes("userId");
CREATE INDEX idx_notes_date_userId ON notes(date, "userId");
CREATE INDEX idx_notes_createdAt ON notes("createdAt");
CREATE INDEX idx_notes_deadline ON notes(deadline);
CREATE INDEX idx_notes_completedAt ON notes("completedAt");

-- Tags table indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_userId ON tags("userId");

-- ============================================================================
-- STEP 7: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_NoteToTag" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: Create RLS Policies for notes table
-- ============================================================================

-- Policy: Users can view only their own notes
CREATE POLICY notes_select_policy ON notes
  FOR SELECT
  USING (auth.uid() = "userId");

-- Policy: Users can insert only their own notes
CREATE POLICY notes_insert_policy ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

-- Policy: Users can update only their own notes
CREATE POLICY notes_update_policy ON notes
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Policy: Users can delete only their own notes
CREATE POLICY notes_delete_policy ON notes
  FOR DELETE
  USING (auth.uid() = "userId");

-- ============================================================================
-- STEP 9: Create RLS Policies for tags table
-- ============================================================================

-- Policy: Users can view only their own tags
CREATE POLICY tags_select_policy ON tags
  FOR SELECT
  USING (auth.uid() = "userId");

-- Policy: Users can insert only their own tags
CREATE POLICY tags_insert_policy ON tags
  FOR INSERT
  WITH CHECK (auth.uid() = "userId");

-- Policy: Users can update only their own tags
CREATE POLICY tags_update_policy ON tags
  FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- Policy: Users can delete only their own tags
CREATE POLICY tags_delete_policy ON tags
  FOR DELETE
  USING (auth.uid() = "userId");

-- ============================================================================
-- STEP 10: Create RLS Policies for _NoteToTag junction table
-- ============================================================================

-- Policy: Users can view note-tag relations for their own notes
CREATE POLICY note_to_tag_select_policy ON "_NoteToTag"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId" = auth.uid()
    )
  );

-- Policy: Users can insert note-tag relations for their own notes
CREATE POLICY note_to_tag_insert_policy ON "_NoteToTag"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId" = auth.uid()
    )
  );

-- Policy: Users can delete note-tag relations for their own notes
CREATE POLICY note_to_tag_delete_policy ON "_NoteToTag"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId" = auth.uid()
    )
  );

-- ============================================================================
-- STEP 11: Create function to automatically update updatedAt timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notes table
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables were created
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN ('notes', 'tags', '_NoteToTag')
ORDER BY tablename;

-- Verify indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('notes', 'tags', '_NoteToTag')
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('notes', 'tags', '_NoteToTag')
ORDER BY tablename;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- 1. Ensure Email/Password authentication is enabled in Supabase:
--    Dashboard → Authentication → Providers → Email → Enable
--
-- 2. Create your first user account through the app's signup flow
--
-- 3. You're ready to start using the app!
-- ============================================================================
