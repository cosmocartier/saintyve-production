-- Allow the 'category' role (used for Category/Brand page images) in product_images_cf.
-- The role_check constraint previously only allowed primary/hover/gallery/title,
-- which caused inserts with role = 'category' to fail with a check constraint violation.

ALTER TABLE product_images_cf
  DROP CONSTRAINT IF EXISTS product_images_cf_role_check;

ALTER TABLE product_images_cf
  ADD CONSTRAINT product_images_cf_role_check
  CHECK (role = ANY (ARRAY['primary'::text, 'hover'::text, 'gallery'::text, 'title'::text, 'category'::text]));
