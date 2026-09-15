-- Add a flag so specific product_images_cf rows can be designated as
-- "Category Images" - images meant to be shown only on Category/Brand
-- listing pages, independent from the primary/hover/gallery images used
-- on the product detail page.
ALTER TABLE product_images_cf
  ADD COLUMN IF NOT EXISTS category_image BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_product_images_cf_category_image
  ON product_images_cf(product_id, sort_order)
  WHERE category_image = true;
