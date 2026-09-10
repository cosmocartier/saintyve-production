-- Add payment reminder tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS last_payment_reminder_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_reminder_count INTEGER DEFAULT 0;

-- Create index for faster queries on reminder status
CREATE INDEX IF NOT EXISTS idx_orders_payment_reminder ON orders(last_payment_reminder_at, status);

-- Add comment to columns
COMMENT ON COLUMN orders.last_payment_reminder_at IS 'Timestamp of the last payment reminder email sent for this order';
COMMENT ON COLUMN orders.payment_reminder_count IS 'Number of payment reminder emails sent for this order';
