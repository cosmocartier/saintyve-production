-- Add SEO keywords field to products table for search engine optimization
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

COMMENT ON COLUMN products.seo_keywords IS 'Comma-separated keywords for SEO optimization - not visible on frontend';
