-- Add 'free_item' to the reward_type check constraint in loyalty_rewards table

-- First, drop the existing constraint
ALTER TABLE loyalty_rewards DROP CONSTRAINT IF EXISTS loyalty_rewards_reward_type_check;

-- Add the updated constraint with 'free_item' included
ALTER TABLE loyalty_rewards ADD CONSTRAINT loyalty_rewards_reward_type_check 
  CHECK (reward_type IN ('discount', 'credits', 'free_shipping', 'exclusive_access', 'gift', 'free_item'));

-- Add comment for documentation
COMMENT ON CONSTRAINT loyalty_rewards_reward_type_check ON loyalty_rewards IS 
  'Allowed reward types: discount, credits, free_shipping, exclusive_access, gift, free_item';
