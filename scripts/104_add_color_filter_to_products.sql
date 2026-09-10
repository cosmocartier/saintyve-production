-- Add color_filter column to products table
-- This allows filtering products by color categories

ALTER TABLE products
ADD COLUMN IF NOT EXISTS color_filter TEXT
  CHECK (color_filter IN (
    'Black',
    'White',
    'Grey',
    'Beige',
    'Cream',
    'Brown',
    'Blue',
    'Navy',
    'Light Blue',
    'Red',
    'Burgundy',
    'Pink',
    'Green',
    'Olive',
    'Yellow',
    'Orange',
    'Purple',
    'Silver',
    'Gold',
    'Multicolor',
    'Transparent'
  ));

-- Create index for color filter queries
CREATE INDEX IF NOT EXISTS idx_products_color_filter ON products(color_filter) WHERE color_filter IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.color_filter IS 'Primary color category for filtering products';
