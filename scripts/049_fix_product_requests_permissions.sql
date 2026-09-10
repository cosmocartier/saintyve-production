-- Fix product_requests table permissions
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own requests" ON product_requests;
DROP POLICY IF EXISTS "Users can create requests" ON product_requests;
DROP POLICY IF EXISTS "Admin full access to requests" ON product_requests;

-- Drop the problematic foreign key constraint
ALTER TABLE product_requests 
DROP CONSTRAINT IF EXISTS product_requests_user_id_fkey;

-- Recreate policies without foreign key issues
CREATE POLICY "Users can view own requests"
ON product_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create requests"
ON product_requests
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Admin full access to requests"
ON product_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
