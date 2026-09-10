-- Add sub_category column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category);

-- Add comment
COMMENT ON COLUMN products.sub_category IS 'Product sub-category (e.g., Sneakers, Backpack, T-Shirt)';
