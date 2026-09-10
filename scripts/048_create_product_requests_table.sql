-- Create product_requests table
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT,
  reference_link TEXT,
  details TEXT NOT NULL,
  image_urls TEXT[],
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  -- Remove foreign key to auth.users to avoid permission issues
  user_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_requests_user_id ON product_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_created_at ON product_requests(created_at DESC);

-- Enable RLS
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

-- Simplified policy that doesn't try to SELECT from auth.users
-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON product_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Anyone can insert requests (including anonymous users)
CREATE POLICY "Anyone can create requests"
  ON product_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON product_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_product_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_requests_updated_at_trigger
  BEFORE UPDATE ON product_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_product_requests_updated_at();
