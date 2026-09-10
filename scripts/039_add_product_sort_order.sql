-- Add sort_order column to product_categories junction table
ALTER TABLE public.product_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_product_categories_sort_order 
ON public.product_categories(category_id, sort_order);

-- Initialize sort_order for existing records
UPDATE public.product_categories
SET sort_order = subquery.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) as row_num
  FROM public.product_categories
) as subquery
WHERE public.product_categories.id = subquery.id;

-- Get the Shop All category ID and add all products to it
DO $$
DECLARE
  shop_all_id UUID;
  product_record RECORD;
  next_order INTEGER := 0;
BEGIN
  -- Get Shop All category ID
  SELECT id INTO shop_all_id FROM public.categories WHERE slug = 'shop-all' LIMIT 1;
  
  IF shop_all_id IS NOT NULL THEN
    -- Add all products to Shop All category
    FOR product_record IN 
      SELECT id FROM public.products WHERE status = 'live'
    LOOP
      INSERT INTO public.product_categories (product_id, category_id, sort_order)
      VALUES (product_record.id, shop_all_id, next_order)
      ON CONFLICT (product_id, category_id) DO UPDATE SET sort_order = next_order;
      
      next_order := next_order + 1;
    END LOOP;
  END IF;
END $$;
