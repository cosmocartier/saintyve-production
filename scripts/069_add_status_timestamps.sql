-- Add timestamp columns to track supplier status changes
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_preparing_at ON orders(preparing_at);
CREATE INDEX IF NOT EXISTS idx_orders_in_transit_at ON orders(in_transit_at);

-- Function to update status timestamps
CREATE OR REPLACE FUNCTION update_supplier_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to preparing, record the timestamp
  IF NEW.supplier_status = 'preparing' AND (OLD.supplier_status IS NULL OR OLD.supplier_status != 'preparing') THEN
    NEW.preparing_at = NOW();
  END IF;
  
  -- When status changes to in_transit, record the timestamp
  IF NEW.supplier_status = 'in_transit' AND (OLD.supplier_status IS NULL OR OLD.supplier_status != 'in_transit') THEN
    NEW.in_transit_at = NOW();
  END IF;
  
  -- When status changes to delivered, record the timestamp
  IF NEW.supplier_status = 'delivered' AND (OLD.supplier_status IS NULL OR OLD.supplier_status != 'delivered') THEN
    NEW.delivered_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps
DROP TRIGGER IF EXISTS trigger_update_supplier_status_timestamps ON orders;
CREATE TRIGGER trigger_update_supplier_status_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.supplier_status IS DISTINCT FROM NEW.supplier_status)
  EXECUTE FUNCTION update_supplier_status_timestamps();

-- Backfill preparing_at for existing orders in preparing status
UPDATE orders
SET preparing_at = updated_at
WHERE supplier_status = 'preparing' AND preparing_at IS NULL;

-- Backfill in_transit_at for existing orders in in_transit status
UPDATE orders
SET in_transit_at = updated_at
WHERE supplier_status = 'in_transit' AND in_transit_at IS NULL;

-- Backfill delivered_at for existing orders in delivered status
UPDATE orders
SET delivered_at = updated_at
WHERE supplier_status = 'delivered' AND delivered_at IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.preparing_at IS 'Timestamp when order status changed to preparing';
COMMENT ON COLUMN orders.in_transit_at IS 'Timestamp when order status changed to in_transit';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order status changed to delivered';
