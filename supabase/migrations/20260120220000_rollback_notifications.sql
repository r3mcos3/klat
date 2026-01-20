-- Rollback: Remove notification tables and RPC function
-- This migration removes all notification-related database objects

-- Drop RPC function if it exists
DROP FUNCTION IF EXISTS get_user_email_and_prefs(UUID);

-- Drop tables if they exist
DROP TABLE IF EXISTS notification_logs;
DROP TABLE IF EXISTS user_preferences;
