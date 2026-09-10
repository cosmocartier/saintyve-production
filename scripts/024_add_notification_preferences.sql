-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

-- Update RLS policies to allow users to update their own notification preferences
-- (existing policies should already cover this, but adding explicit comment for clarity)
COMMENT ON COLUMN profiles.email_notifications IS 'User preference for order notification emails';
COMMENT ON COLUMN profiles.marketing_emails IS 'User preference for marketing emails';
