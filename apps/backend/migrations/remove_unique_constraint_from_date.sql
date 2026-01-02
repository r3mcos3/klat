-- Remove unique constraint from notes.date to allow multiple notes per day
-- This migration changes the system from "one note per day" to "multiple notes per day"

-- Drop the unique constraint on the date column
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_date_key;

-- Create index on createdAt for sorting notes within a day
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(createdAt);

-- Add comment to explain the change
COMMENT ON COLUMN notes.date IS 'Note date - can have multiple notes per day, sorted by createdAt';
