-- Add supplier_status field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS supplier_status TEXT DEFAULT 'unprocessed';

-- Add check constraint for valid statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_supplier_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_supplier_status_check 
  CHECK (supplier_status IN ('unprocessed', 'preparing', 'shipped'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_supplier_status ON orders(supplier_status);

-- Update existing orders based on processed_by_supplier flag
UPDATE orders 
SET supplier_status = CASE 
  WHEN processed_by_supplier = true THEN 'preparing'
  ELSE 'unprocessed'
END
WHERE supplier_status = 'unprocessed';

-- Update RLS policies to include supplier_status
DROP POLICY IF EXISTS "Suppliers can view processing orders" ON orders;
CREATE POLICY "Suppliers can view processing orders" ON orders
  FOR SELECT
  USING (
    status = 'processing' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supplier'
    )
  );

-- Allow suppliers to update supplier_status and tracking_number
DROP POLICY IF EXISTS "Suppliers can update order status" ON orders;
CREATE POLICY "Suppliers can update order status" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supplier'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supplier'
    )
  );
