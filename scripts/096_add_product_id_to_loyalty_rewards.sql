-- Add product_id column to loyalty_rewards table for free item rewards
ALTER TABLE loyalty_rewards 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

COMMENT ON COLUMN loyalty_rewards.product_id IS 'For free_item reward type: the product to be given for free';
