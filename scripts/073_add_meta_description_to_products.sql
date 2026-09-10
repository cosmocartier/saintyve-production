-- Add meta_description column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN products.meta_description IS 'Custom SEO meta description for search results. Falls back to auto-generated description if empty.';
