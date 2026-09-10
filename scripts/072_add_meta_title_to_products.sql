-- Add meta_title column to products table for SEO
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;

-- Add comment to document the column
COMMENT ON COLUMN products.meta_title IS 'SEO meta title used in <title> tag. Falls back to auto-generated format if null.';
