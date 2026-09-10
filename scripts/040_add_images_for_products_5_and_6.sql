-- Add placeholder product_images rows for products 5 and 6
-- Display order 0 (front images)
-- Updated to use empty URLs for manual entry
-- URLs can be manually added later

INSERT INTO product_images (
  id,
  product_id,
  url,
  alt_text,
  display_order,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000005',
    '', -- Empty URL - to be filled manually
    NULL,
    0,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000006',
    '', -- Empty URL - to be filled manually
    NULL,
    0,
    NOW(),
    NOW()
  );
