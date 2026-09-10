-- Add 'black' tier to the profiles status constraint
-- This script fixes the missing 'black' tier that was added to loyalty_rewards but not to profiles

-- Step 1: Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_membership_status;

-- Step 2: Add new constraint with all five tiers including 'black'
ALTER TABLE profiles
ADD CONSTRAINT valid_membership_status 
CHECK (status IN ('bronze', 'silver', 'gold', 'platinum', 'black'));

-- Step 3: Verify all existing profile status values are valid
-- (This should not update anything if data is already correct)
UPDATE profiles
SET status = 'bronze'
WHERE status IS NULL OR status NOT IN ('bronze', 'silver', 'gold', 'platinum', 'black');
