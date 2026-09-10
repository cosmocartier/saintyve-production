-- Add use_cloudflare_images toggle to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS use_cloudflare_images BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN products.use_cloudflare_images IS 'When true, product page will use Cloudflare Images (product_images_cf) instead of legacy Supabase images (product_images)';
