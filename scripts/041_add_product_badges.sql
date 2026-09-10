-- Add badge fields to products table for Best-Seller and New In indicators
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_new_in BOOLEAN DEFAULT FALSE;

-- Add comment explaining the fields
COMMENT ON COLUMN products.is_bestseller IS 'Displays a Best-Seller badge on the product card';
COMMENT ON COLUMN products.is_new_in IS 'Displays a New In badge on the product card';
