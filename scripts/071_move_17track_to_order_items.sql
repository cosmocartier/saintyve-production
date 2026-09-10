-- Move 17TRACK fields from orders table to order_items table
-- This corrects the mistake from script 070 where fields were added to wrong table

-- Remove 17TRACK fields from orders table
ALTER TABLE orders 
DROP COLUMN IF EXISTS tracking_carrier_code,
DROP COLUMN IF EXISTS tracking_registered_at,
DROP COLUMN IF EXISTS tracking_17track_tag,
DROP COLUMN IF EXISTS tracking_sync_status;

-- Add 17TRACK fields to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS tracking_carrier_code INTEGER,
ADD COLUMN IF NOT EXISTS tracking_registered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_17track_tag TEXT,
ADD COLUMN IF NOT EXISTS tracking_sync_status TEXT CHECK (tracking_sync_status IN ('pending', 'synced', 'failed'));

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_order_items_tracking_sync 
ON order_items(tracking_sync_status) 
WHERE tracking_sync_status IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN order_items.tracking_carrier_code IS '17TRACK carrier code for tracking';
COMMENT ON COLUMN order_items.tracking_registered_at IS 'Timestamp when tracking was registered with 17TRACK';
COMMENT ON COLUMN order_items.tracking_17track_tag IS 'Custom tag for 17TRACK (order_item_id)';
COMMENT ON COLUMN order_items.tracking_sync_status IS 'Status of 17TRACK sync: pending, synced, or failed';
