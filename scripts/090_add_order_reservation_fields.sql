-- Add reservation and cancellation fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS reserved_until timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancel_reason text;

-- Create index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_orders_reserved_until ON orders(reserved_until) WHERE status IN ('pending');

-- Add comment
COMMENT ON COLUMN orders.reserved_until IS 'Timestamp when the order reservation expires (30 minutes from creation for manual transfers)';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when the order was cancelled';
COMMENT ON COLUMN orders.cancel_reason IS 'Reason for order cancellation (e.g., reservation_expired, user_cancelled)';
