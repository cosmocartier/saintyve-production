-- Add credits_applied column to orders table to track how many credits were used
ALTER TABLE orders ADD COLUMN IF NOT EXISTS credits_applied INTEGER DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN orders.credits_applied IS 'Number of credits the user applied to this order (1 credit = EUR 0.89)';
