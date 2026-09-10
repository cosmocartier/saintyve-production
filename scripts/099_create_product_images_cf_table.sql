-- Create product_images_cf table for Cloudflare Images
CREATE TABLE IF NOT EXISTS product_images_cf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cf_image_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('primary', 'hover', 'gallery')),
  sort_order INT NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_cf_product_id ON product_images_cf(product_id);

-- Create partial unique indexes instead of inline UNIQUE constraints with WHERE
-- Ensure only one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_cf_unique_primary 
  ON product_images_cf(product_id) WHERE role = 'primary';

-- Ensure only one hover image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_cf_unique_hover 
  ON product_images_cf(product_id) WHERE role = 'hover';

-- Ensure unique sort_order per product for gallery images
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_cf_unique_gallery_order 
  ON product_images_cf(product_id, sort_order) WHERE role = 'gallery';

-- Enable RLS
ALTER TABLE product_images_cf ENABLE ROW LEVEL SECURITY;

-- Allow public reads (anon/auth)
CREATE POLICY "Allow public read access to product_images_cf"
  ON product_images_cf
  FOR SELECT
  USING (true);

-- Server-side writes only (handled via service role in API routes)
-- No client-side write policies
