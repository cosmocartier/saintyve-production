-- Populate product_images table with front images for all existing products
-- This creates a row with display_order = 0 for each product using their storage folder

-- Updated to use image_folder and construct proper Supabase Storage URLs
INSERT INTO public.product_images (
  id,
  product_id,
  url,
  alt_text,
  display_order,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  p.id,
  -- Construct the Supabase Storage URL for front.png
  'https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/' || 
  REPLACE(p.image_folder, ' ', '%20') || '/front.png',
  p.name || ' - Front View',
  0,
  NOW(),
  NOW()
FROM public.products p
WHERE p.image_folder IS NOT NULL
  AND p.image_folder != ''
  AND NOT EXISTS (
    SELECT 1 
    FROM public.product_images pi 
    WHERE pi.product_id = p.id 
    AND pi.display_order = 0
  );

-- Create a helpful comment
COMMENT ON TABLE public.product_images IS 'Stores multiple images per product. display_order = 0 indicates the front/main image.';
