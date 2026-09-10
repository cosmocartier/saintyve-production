-- Add pending_credits field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pending_credits boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN orders.pending_credits IS 'Indicates if this order has pending credits to be awarded (15 credits promotion)';
