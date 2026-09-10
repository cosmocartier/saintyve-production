-- Create junction table for many-to-many relationship between products and categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON public.product_categories(category_id);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to product_categories"
  ON public.product_categories FOR SELECT
  TO public
  USING (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access to product_categories"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Migrate existing category_id data to junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Add special categories: NEW IN and SHOP ALL
INSERT INTO public.categories (name, slug, main_category, display_order) VALUES
  ('New In', 'new-in', 'New In', 0),
  ('Shop All', 'shop-all', 'Shop All', 0)
ON CONFLICT (slug) DO NOTHING;

-- Keep category_id column for backwards compatibility but it's now deprecated
-- Use product_categories junction table instead
