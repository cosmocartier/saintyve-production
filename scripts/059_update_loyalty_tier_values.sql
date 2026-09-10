-- Step 1: Drop the old constraint
ALTER TABLE loyalty_rewards DROP CONSTRAINT IF EXISTS loyalty_rewards_tier_check;

-- Step 2: Update any existing data to use lowercase tier names
UPDATE loyalty_rewards 
SET tier = CASE 
    WHEN tier = 'Bronze Edition' THEN 'bronze'
    WHEN tier = 'Silver Edition' THEN 'silver'
    WHEN tier = 'Gold Edition' THEN 'gold'
    WHEN tier = 'Platinum Edition' THEN 'platinum'
    WHEN tier = 'Black Edition' THEN 'black'
    ELSE tier
END
WHERE tier IN ('Bronze Edition', 'Silver Edition', 'Gold Edition', 'Platinum Edition', 'Black Edition');

-- Step 3: Add new constraint with lowercase tier names
ALTER TABLE loyalty_rewards
ADD CONSTRAINT loyalty_rewards_tier_check 
CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'black'));

-- Step 4: Update any existing user rewards to match
UPDATE loyalty_user_rewards lur
SET status = CASE 
    WHEN status = 'Bronze Edition' THEN 'bronze'
    WHEN status = 'Silver Edition' THEN 'silver'
    WHEN status = 'Gold Edition' THEN 'gold'
    WHEN status = 'Platinum Edition' THEN 'platinum'
    WHEN status = 'Black Edition' THEN 'black'
    ELSE status
END
FROM loyalty_rewards lr
WHERE lur.reward_id = lr.id
AND lr.tier IN ('bronze', 'silver', 'gold', 'platinum', 'black');
