-- Fix Performance and Security Issues
-- This migration addresses Supabase advisor warnings

-- ============================================
-- PERFORMANCE: Fix RLS policies to use subquery
-- ============================================
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- Notes table policies
DROP POLICY IF EXISTS notes_select_policy ON notes;
DROP POLICY IF EXISTS notes_insert_policy ON notes;
DROP POLICY IF EXISTS notes_update_policy ON notes;
DROP POLICY IF EXISTS notes_delete_policy ON notes;

CREATE POLICY notes_select_policy ON notes
  FOR SELECT USING ("userId"::uuid = (select auth.uid()));

CREATE POLICY notes_insert_policy ON notes
  FOR INSERT WITH CHECK ("userId"::uuid = (select auth.uid()));

CREATE POLICY notes_update_policy ON notes
  FOR UPDATE USING ("userId"::uuid = (select auth.uid()));

CREATE POLICY notes_delete_policy ON notes
  FOR DELETE USING ("userId"::uuid = (select auth.uid()));

-- Tags table policies
DROP POLICY IF EXISTS tags_select_policy ON tags;
DROP POLICY IF EXISTS tags_insert_policy ON tags;
DROP POLICY IF EXISTS tags_update_policy ON tags;
DROP POLICY IF EXISTS tags_delete_policy ON tags;

CREATE POLICY tags_select_policy ON tags
  FOR SELECT USING ("userId"::uuid = (select auth.uid()));

CREATE POLICY tags_insert_policy ON tags
  FOR INSERT WITH CHECK ("userId"::uuid = (select auth.uid()));

CREATE POLICY tags_update_policy ON tags
  FOR UPDATE USING ("userId"::uuid = (select auth.uid()));

CREATE POLICY tags_delete_policy ON tags
  FOR DELETE USING ("userId"::uuid = (select auth.uid()));

-- _NoteToTag junction table policies
DROP POLICY IF EXISTS note_to_tag_select_policy ON "_NoteToTag";
DROP POLICY IF EXISTS note_to_tag_insert_policy ON "_NoteToTag";
DROP POLICY IF EXISTS note_to_tag_delete_policy ON "_NoteToTag";

CREATE POLICY note_to_tag_select_policy ON "_NoteToTag"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId"::uuid = (select auth.uid())
    )
  );

CREATE POLICY note_to_tag_insert_policy ON "_NoteToTag"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId"::uuid = (select auth.uid())
    )
  );

CREATE POLICY note_to_tag_delete_policy ON "_NoteToTag"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = "_NoteToTag"."A"
      AND notes."userId"::uuid = (select auth.uid())
    )
  );

-- ============================================
-- PERFORMANCE: Remove unused indexes
-- ============================================

DROP INDEX IF EXISTS notes_in_progress_idx;
DROP INDEX IF EXISTS idx_notes_userid_date;
DROP INDEX IF EXISTS idx_notes_deadline;
DROP INDEX IF EXISTS idx_notes_completedat;

-- ============================================
-- SECURITY: Fix function search_path
-- ============================================

-- Recreate update_updated_at_column function with immutable search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger for notes table
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updatedAt timestamp on row update';
