-- On-Wear images: editorial "styled / on-wear" shots shown only on the product page
-- in a dedicated mosaic (max 6). They are fully separate from the regular gallery
-- (role = 'gallery') and the Category/Brand images (role = 'category').
--
-- Like category images, on-wear images need their own role so they don't collide
-- with the gallery's unique index on (product_id, sort_order) WHERE role = 'gallery'
-- (both start sort_order at 0).

-- 1. Add the on_wear flag column
ALTER TABLE product_images_cf
  ADD COLUMN IF NOT EXISTS on_wear boolean NOT NULL DEFAULT false;

-- 2. Allow the 'onwear' role in the role_check constraint
ALTER TABLE product_images_cf
  DROP CONSTRAINT IF EXISTS product_images_cf_role_check;

ALTER TABLE product_images_cf
  ADD CONSTRAINT product_images_cf_role_check
  CHECK (role = ANY (ARRAY['primary'::text, 'hover'::text, 'gallery'::text, 'title'::text, 'category'::text, 'onwear'::text]));

-- 3. Give on-wear images their own dedicated uniqueness guarantee on sort_order,
--    mirroring the gallery and category indexes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_cf_unique_on_wear_order
  ON product_images_cf(product_id, sort_order)
  WHERE role = 'onwear';
