-- Add gender column to products table
ALTER TABLE products
ADD COLUMN gender text;

-- Add CHECK constraint to ensure only valid gender values
ALTER TABLE products
ADD CONSTRAINT products_gender_check CHECK (gender IN ('Men', 'Women', 'Unisex'));

-- Add comment to explain the column
COMMENT ON COLUMN products.gender IS 'Product gender category: Men, Women, or Unisex';

-- Create index for faster filtering by gender
CREATE INDEX idx_products_gender ON products(gender) WHERE gender IS NOT NULL;
