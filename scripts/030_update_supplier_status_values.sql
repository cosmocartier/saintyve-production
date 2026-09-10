-- Add new supplier status values for order tracking
-- This allows suppliers to track orders through all stages: unprocessed → preparing → in_transit → delivered

-- First, update any existing 'shipped' statuses to 'in_transit'
UPDATE orders 
SET supplier_status = 'in_transit' 
WHERE supplier_status = 'shipped';

-- Drop the existing check constraint if it exists
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_supplier_status_check;

-- Add a new check constraint with all valid supplier status values
ALTER TABLE orders 
ADD CONSTRAINT orders_supplier_status_check 
CHECK (supplier_status IN ('unprocessed', 'preparing', 'in_transit', 'delivered'));

-- Add a comment to document the valid values
COMMENT ON COLUMN orders.supplier_status IS 'Supplier order status: unprocessed, preparing, in_transit, delivered';
