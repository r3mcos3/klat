-- Add tables for email notification preferences and logging
-- This migration adds user preferences and notification logs

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on userId for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences("userId");

-- Add comment
COMMENT ON TABLE user_preferences IS 'User notification preferences';

-- Notification logs table (to prevent duplicate notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY,
  "noteId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint to prevent duplicate notifications per note
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_logs_unique ON notification_logs("noteId", type);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_note_id ON notification_logs("noteId");
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs("userId");

-- Add comment
COMMENT ON TABLE notification_logs IS 'Log of sent notifications to prevent duplicates';
