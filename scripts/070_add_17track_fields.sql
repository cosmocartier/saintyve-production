-- Add 17TRACK tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_carrier_code INTEGER,
ADD COLUMN IF NOT EXISTS tracking_registered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_17track_tag TEXT,
ADD COLUMN IF NOT EXISTS tracking_sync_status TEXT DEFAULT 'pending' CHECK (tracking_sync_status IN ('pending', 'synced', 'failed'));

-- Add index for tracking sync status
CREATE INDEX IF NOT EXISTS idx_orders_tracking_sync_status ON orders(tracking_sync_status);

-- Add comment explaining the fields
COMMENT ON COLUMN orders.tracking_carrier_code IS '17TRACK carrier code (numeric identifier for the shipping carrier)';
COMMENT ON COLUMN orders.tracking_registered_at IS 'Timestamp when tracking was registered with 17TRACK API';
COMMENT ON COLUMN orders.tracking_17track_tag IS 'Tag used in 17TRACK (typically the order ID for mapping)';
COMMENT ON COLUMN orders.tracking_sync_status IS 'Status of 17TRACK sync: pending, synced, or failed';
