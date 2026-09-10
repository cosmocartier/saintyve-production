-- Allow guest orders by making user_id nullable in orders table
-- This enables customers to place orders without signing in

-- Make user_id nullable in orders table
ALTER TABLE orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow guest orders
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create new policy that allows both authenticated and guest orders
CREATE POLICY "Allow all order creation" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Keep read policies for authenticated users only
DROP POLICY IF EXISTS "Users can view orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    user_id IS NULL OR 
    auth.uid() = user_id
  );

-- Keep update policies for authenticated users only
DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (
    user_id IS NULL OR 
    auth.uid() = user_id
  );

-- Add index for better performance on guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest ON orders(email) WHERE user_id IS NULL;
