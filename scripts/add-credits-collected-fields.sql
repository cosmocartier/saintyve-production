-- Add credits_collected boolean field to track collected submissions

-- Add credits_collected to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS credits_collected BOOLEAN DEFAULT FALSE;

-- Add credits_collected to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS credits_collected BOOLEAN DEFAULT FALSE;

-- Add credits_collected to tiktok_submissions table
ALTER TABLE tiktok_submissions
ADD COLUMN IF NOT EXISTS credits_collected BOOLEAN DEFAULT FALSE;

-- Add credits_collected to trustpilot_submissions table
ALTER TABLE trustpilot_submissions
ADD COLUMN IF NOT EXISTS credits_collected BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_credits_collected ON orders(user_id, pending_credits, credits_collected) WHERE pending_credits = TRUE AND credits_collected = FALSE;
CREATE INDEX IF NOT EXISTS idx_referrals_credits_collected ON referrals(referrer_id, credits_collected) WHERE credits_collected = FALSE;
CREATE INDEX IF NOT EXISTS idx_tiktok_credits_collected ON tiktok_submissions(user_id, credits_collected) WHERE credits_collected = FALSE;
CREATE INDEX IF NOT EXISTS idx_trustpilot_credits_collected ON trustpilot_submissions(user_id, credits_collected) WHERE credits_collected = FALSE;
