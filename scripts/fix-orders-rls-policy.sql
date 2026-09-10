-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

-- Create new INSERT policy that allows both authenticated users and guest orders
CREATE POLICY "Allow order creation for all users"
ON orders
FOR INSERT
WITH CHECK (
  -- Allow authenticated users to create orders
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Allow guest orders (no authentication required)
  (user_id IS NULL)
);

-- Ensure SELECT policy allows viewing orders
DROP POLICY IF EXISTS "Users can view orders" ON orders;
CREATE POLICY "Users can view own orders and guest can view by email"
ON orders
FOR SELECT
USING (
  -- Authenticated users can see their orders
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Admin users can see all orders
  (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'support@designerdrip.store'))
  OR
  -- Allow viewing any order (needed for guest order confirmation page)
  true
);

-- Update UPDATE policy to allow updates for authenticated users and admin
DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update own orders"
ON orders
FOR UPDATE
USING (
  -- Authenticated users can update their orders
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Admin users can update all orders
  (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'support@designerdrip.store'))
);
