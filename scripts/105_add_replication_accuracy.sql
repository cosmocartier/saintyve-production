-- Add replication_accuracy column to products table
-- This field represents how accurately the product is reproduced compared to retail reference models

ALTER TABLE products
ADD COLUMN IF NOT EXISTS replication_accuracy NUMERIC(3,0)
  CHECK (replication_accuracy >= 1 AND replication_accuracy <= 100);

-- Create index for filtering products by replication accuracy
CREATE INDEX IF NOT EXISTS idx_products_replication_accuracy 
  ON products(replication_accuracy) 
  WHERE replication_accuracy IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.replication_accuracy IS 'Accuracy rating (1-100) compared against retail reference models. Measures materials, shape, stitching, branding, and overall visual match.';
