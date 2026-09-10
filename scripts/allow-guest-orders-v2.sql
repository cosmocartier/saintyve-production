-- Migration: Allow guest orders by making user_id nullable
-- This script removes the NOT NULL constraint on user_id and updates RLS policies

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Allow insert for all users" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON orders;

-- Step 2: Make user_id nullable to allow guest orders
ALTER TABLE orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Create new RLS policies that support both authenticated and guest orders

-- Allow all users (authenticated and guests) to create orders
CREATE POLICY "Allow order creation for all"
ON orders
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own orders (authenticated users)
-- and allow viewing guest orders by email
CREATE POLICY "Allow viewing own orders"
ON orders
FOR SELECT
TO public
USING (
  user_id = auth.uid() OR 
  user_id IS NULL
);

-- Allow users to update only their own orders
CREATE POLICY "Allow updating own orders"
ON orders
FOR UPDATE
TO public
USING (
  user_id = auth.uid() OR 
  user_id IS NULL
)
WITH CHECK (
  user_id = auth.uid() OR 
  user_id IS NULL
);

-- Note: Guest orders (user_id IS NULL) can be viewed/updated by anyone
-- You may want to add email-based verification in your application logic
-- to ensure only the guest who placed the order can view it
