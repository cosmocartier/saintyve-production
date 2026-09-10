-- Clean up and standardize product main categories
-- This script migrates all products to use one of the 7 main category values

-- First, update any existing products with similar names to the standard categories
UPDATE products SET category = 'Sneaker' WHERE LOWER(category) IN ('sneaker', 'sneakers', 'running shoes', 'shoes');
UPDATE products SET category = 'Jacket' WHERE LOWER(category) IN ('jacket', 'jackets', 'outerwear');
UPDATE products SET category = 'Vest' WHERE LOWER(category) IN ('vest', 'vests');
UPDATE products SET category = 'Bag' WHERE LOWER(category) IN ('bag', 'bags', 'accessories');
UPDATE products SET category = 'Watch' WHERE LOWER(category) IN ('watch', 'watches');
UPDATE products SET category = 'Jewelry' WHERE LOWER(category) IN ('jewelry', 'jewellery', 'accessories');
UPDATE products SET category = 'Accessory' WHERE LOWER(category) IN ('accessory', 'accessories', 'apparel', 'other');

-- Set any remaining products without a valid category to 'Accessory' as default
UPDATE products SET category = 'Accessory' WHERE category IS NULL OR category NOT IN ('Sneaker', 'Jacket', 'Vest', 'Bag', 'Watch', 'Jewelry', 'Accessory');

-- Drop the old constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check') THEN
    ALTER TABLE products DROP CONSTRAINT products_category_check;
  END IF;
END $$;

-- Add the new constraint with the 7 main categories
ALTER TABLE products 
ADD CONSTRAINT products_category_check 
CHECK (category IN ('Sneaker', 'Jacket', 'Vest', 'Bag', 'Watch', 'Jewelry', 'Accessory'));

-- Make category NOT NULL since every product should have a main category
ALTER TABLE products ALTER COLUMN category SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
