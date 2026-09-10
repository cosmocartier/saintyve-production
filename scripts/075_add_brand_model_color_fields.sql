-- Add brand, model, and color fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);

-- Ensure slug has unique index (if not already)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products(slug);

-- Add comment to explain the schema change
COMMENT ON COLUMN products.brand IS 'Product brand name (e.g., "Jordan", "Nike", "Balenciaga")';
COMMENT ON COLUMN products.model IS 'Product model name (e.g., "1 Low", "Air Max 90")';
COMMENT ON COLUMN products.color IS 'Product color variant (e.g., "Travis Scott Velvet Brown", "Black White")';
