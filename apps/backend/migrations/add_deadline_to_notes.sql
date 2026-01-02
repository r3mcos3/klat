-- Add deadline column to notes table
-- This migration adds an optional deadline field for to-do functionality

ALTER TABLE notes
ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;

-- Create index on deadline for efficient queries
CREATE INDEX idx_notes_deadline ON notes(deadline);

-- Add comment to explain the column
COMMENT ON COLUMN notes.deadline IS 'Optional deadline for to-do items';
