-- Allow guest users to create order items
-- This enables order items to be inserted for both authenticated and guest orders

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can update order items" ON order_items;
DROP POLICY IF EXISTS "Allow insert order items" ON order_items;
DROP POLICY IF EXISTS "Allow select order items" ON order_items;
DROP POLICY IF EXISTS "Allow update order items" ON order_items;

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create new policy to allow all order items to be inserted
-- This is necessary because order items can be created for guest orders (no user_id)
CREATE POLICY "Allow insert order items for all"
ON order_items
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to view order items for their own orders
CREATE POLICY "Allow select order items"
ON order_items
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- Allow updates to order items (for admin/supplier purposes)
CREATE POLICY "Allow update order items"
ON order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id
  )
);
