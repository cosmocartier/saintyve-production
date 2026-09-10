-- Add material and style_type columns to products table with constraints and indexes
-- This enables structured product attributes for consistent descriptions, filtering, and SEO

-- Add material column (nullable for now, will be required via UI)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS material TEXT;

-- Add style_type column (nullable for now, will be required via UI)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS style_type TEXT;

-- Drop existing category constraint if it exists
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_category_check;

-- Update existing category values to match new constraint
-- Map common variations to standardized values
UPDATE products
SET category = CASE
  WHEN LOWER(category) = 'sneaker' OR LOWER(category) = 'sneakers' THEN 'Sneaker'
  WHEN LOWER(category) = 'jacket' OR LOWER(category) = 'jackets' THEN 'Jacket'
  WHEN LOWER(category) = 'vest' OR LOWER(category) = 'vests' THEN 'Vest'
  WHEN LOWER(category) = 'bag' OR LOWER(category) = 'bags' THEN 'Bag'
  WHEN LOWER(category) = 'watch' OR LOWER(category) = 'watches' THEN 'Watch'
  WHEN LOWER(category) = 'jewelry' THEN 'Jewelry'
  WHEN LOWER(category) = 'accessory' OR LOWER(category) = 'accessories' THEN 'Accessory'
  ELSE category
END
WHERE category IS NOT NULL;

-- Add category constraint only if all existing values are valid
-- First, check if there are any invalid categories remaining
DO $$
BEGIN
  -- Only add constraint if all categories are valid
  IF NOT EXISTS (
    SELECT 1 FROM products
    WHERE category IS NOT NULL
    AND category NOT IN ('Sneaker', 'Jacket', 'Vest', 'Bag', 'Watch', 'Jewelry', 'Accessory')
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_category_check 
    CHECK (category IN (
      'Sneaker',
      'Jacket',
      'Vest',
      'Bag',
      'Watch',
      'Jewelry',
      'Accessory'
    ));
  ELSE
    RAISE NOTICE 'Some products have invalid categories. Constraint not added. Please review and update manually.';
  END IF;
END $$;

-- Style type constraint (nullable, no strict constraint for backward compatibility)
-- UI will enforce this for new products
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_style_type_check;

-- Don't add strict constraint yet since existing products don't have this field
-- COMMENT: Uncomment the following after all products have been updated:
-- ALTER TABLE products
-- ADD CONSTRAINT products_style_type_check 
-- CHECK (style_type IN (
--   'Streetwear',
--   'Luxury',
--   'Street-Luxury',
--   'Contemporary',
--   'Minimal',
--   'Sport-Inspired',
--   'Classic',
--   'Statement'
-- ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_style_type ON products(style_type);

-- Add composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_category_style ON products(category, style_type);

COMMENT ON COLUMN products.category IS 'Product category: Sneaker, Jacket, Vest, Bag, Watch, Jewelry, Accessory';
COMMENT ON COLUMN products.material IS 'Primary material (e.g., Leather, Suede, Canvas, Stainless steel)';
COMMENT ON COLUMN products.style_type IS 'Style classification: Streetwear, Luxury, Street-Luxury, Contemporary, Minimal, Sport-Inspired, Classic, Statement';
