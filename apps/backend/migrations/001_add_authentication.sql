-- Migration: Add Authentication Support
-- Description: Add userId columns, indexes, and Row Level Security policies
-- Date: 2026-01-03

-- ============================================================================
-- STEP 1: Add userId columns to notes and tags tables
-- ============================================================================

-- Add userId to notes table
ALTER TABLE notes
ADD COLUMN "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add userId to tags table
ALTER TABLE tags
ADD COLUMN "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_notes_userId ON notes("userId");
CREATE INDEX idx_tags_userId ON tags("userId");
CREATE INDEX idx_notes_date_userId ON notes(date, "userId");

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on junction table
ALTER TABLE "_NoteToTag" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies for notes table
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
-- STEP 5: Create RLS Policies for tags table
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
-- STEP 6: Create RLS Policies for _NoteToTag junction table
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
-- NOTES FOR MANUAL EXECUTION
-- ============================================================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Enable Email/Password auth in Supabase Dashboard:
--    Authentication → Providers → Email → Enable
-- 3. After creating your first user account, run the migration script:
--    apps/backend/src/scripts/migrate-notes-to-user.ts
-- ============================================================================
