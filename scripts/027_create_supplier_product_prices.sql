-- Create supplier_product_prices table to store supplier prices for products
CREATE TABLE IF NOT EXISTS supplier_product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  supplier_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE supplier_product_prices ENABLE ROW LEVEL SECURITY;

-- Suppliers can view and manage their own prices
CREATE POLICY "Suppliers can view their own prices"
  ON supplier_product_prices
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supplier'
    )
  );

CREATE POLICY "Suppliers can insert their own prices"
  ON supplier_product_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supplier'
    )
  );

CREATE POLICY "Suppliers can update their own prices"
  ON supplier_product_prices
  FOR UPDATE
  TO authenticated
  USING (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supplier'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_supplier_product_prices_supplier ON supplier_product_prices(supplier_id);
CREATE INDEX idx_supplier_product_prices_product ON supplier_product_prices(product_id);
