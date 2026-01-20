-- Create RPC function to get user email and preferences
-- This function is called by the n8n workflow to fetch user info and notification preferences

CREATE OR REPLACE FUNCTION get_user_email_and_prefs(user_id UUID)
RETURNS TABLE(
  email TEXT,
  "emailNotifications" BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.email::TEXT,
    COALESCE(up."emailNotifications", true) as "emailNotifications"
  FROM auth.users u
  LEFT JOIN user_preferences up ON up."userId" = u.id::TEXT
  WHERE u.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_user_email_and_prefs(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email_and_prefs(UUID) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_email_and_prefs(UUID) IS 'Get user email and notification preferences for deadline reminders';
