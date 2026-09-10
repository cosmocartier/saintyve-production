-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own requests" ON product_requests;
DROP POLICY IF EXISTS "Anyone can insert requests" ON product_requests;
DROP POLICY IF EXISTS "Admins can do everything" ON product_requests;
DROP POLICY IF EXISTS "Allow public insert" ON product_requests;
DROP POLICY IF EXISTS "Users view own requests" ON product_requests;
DROP POLICY IF EXISTS "Anonymous view by email" ON product_requests;
DROP POLICY IF EXISTS "Admins full access" ON product_requests;

-- Disable RLS temporarily
ALTER TABLE product_requests DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert (no restrictions)
CREATE POLICY "Public can insert requests"
ON product_requests
FOR INSERT
WITH CHECK (true);

-- Policy 2: Allow users to view their own requests
CREATE POLICY "Users can view own"
ON product_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Policy 3: Allow anonymous to view (for now - you can restrict this later)
CREATE POLICY "Public can view"
ON product_requests
FOR SELECT
TO anon
USING (true);

-- Policy 4: Admins have full access
CREATE POLICY "Admins have full access"
ON product_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
