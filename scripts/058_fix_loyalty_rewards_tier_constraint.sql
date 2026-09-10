-- Update existing data BEFORE dropping/adding constraint
-- First, update existing rewards to use lowercase tier values
UPDATE loyalty_rewards SET tier = 'bronze' WHERE tier = 'Bronze Edition';
UPDATE loyalty_rewards SET tier = 'silver' WHERE tier = 'Silver Edition';
UPDATE loyalty_rewards SET tier = 'gold' WHERE tier = 'Gold Edition';
UPDATE loyalty_rewards SET tier = 'platinum' WHERE tier = 'Platinum Edition';
UPDATE loyalty_rewards SET tier = 'black' WHERE tier = 'Black Edition';

-- Drop the old constraint
ALTER TABLE loyalty_rewards DROP CONSTRAINT IF EXISTS loyalty_rewards_tier_check;

-- Add new constraint with lowercase tier values that match profiles.status
ALTER TABLE loyalty_rewards ADD CONSTRAINT loyalty_rewards_tier_check 
  CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'black'));
