-- Add membership status column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'bronze';

-- Add check constraint to ensure valid status values
ALTER TABLE profiles
ADD CONSTRAINT valid_membership_status 
CHECK (status IN ('bronze', 'silver', 'gold', 'platinum'));

-- Update existing users to bronze status if null
UPDATE profiles
SET status = 'bronze'
WHERE status IS NULL;
