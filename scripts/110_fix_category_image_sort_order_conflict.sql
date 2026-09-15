-- Category images were being inserted with role = 'gallery', which collided
-- with the existing unique index on (product_id, sort_order) WHERE role = 'gallery'
-- used by the regular product-page gallery images (both start sort_order at 0).
--
-- Category images now use their own role = 'category', so give them their own
-- dedicated uniqueness guarantee, mirroring the gallery's index.

-- Backfill any existing category images that were inserted with role = 'gallery'
UPDATE product_images_cf
SET role = 'category'
WHERE category_image = true AND role = 'gallery';

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_cf_unique_category_order
  ON product_images_cf(product_id, sort_order)
  WHERE role = 'category';
