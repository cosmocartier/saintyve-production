-- Create categories table with hierarchical structure
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  main_category TEXT CHECK (main_category IN ('Men', 'Women', 'Brands', null)),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_main_category ON public.categories(main_category);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- Add category_id to products table (keeping old category field for now)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access to categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert main categories
INSERT INTO public.categories (name, slug, main_category, display_order) VALUES
  ('Men', 'men', 'Men', 1),
  ('Women', 'women', 'Women', 2),
  ('Brands', 'brands', 'Brands', 3)
ON CONFLICT (slug) DO NOTHING;

-- Get the IDs for parent categories
DO $$
DECLARE
  men_id UUID;
  women_id UUID;
BEGIN
  SELECT id INTO men_id FROM public.categories WHERE slug = 'men';
  SELECT id INTO women_id FROM public.categories WHERE slug = 'women';

  -- Insert Men subcategories
  INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
    ('New Arrivals', 'men-new-arrivals', men_id, 'Men', 1),
    ('Tops', 'men-tops', men_id, 'Men', 2),
    ('Bottoms', 'men-bottoms', men_id, 'Men', 3),
    ('Outerwear', 'men-outerwear', men_id, 'Men', 4),
    ('Shoes', 'men-shoes', men_id, 'Men', 5),
    ('Accessories', 'men-accessories', men_id, 'Men', 6),
    ('Sale', 'men-sale', men_id, 'Men', 7)
  ON CONFLICT (slug) DO NOTHING;

  -- Insert Women subcategories
  INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
    ('New Arrivals', 'women-new-arrivals', women_id, 'Women', 1),
    ('Tops', 'women-tops', women_id, 'Women', 2),
    ('Bottoms', 'women-bottoms', women_id, 'Women', 3),
    ('Outerwear', 'women-outerwear', women_id, 'Women', 4),
    ('Shoes', 'women-shoes', women_id, 'Women', 5),
    ('Accessories', 'women-accessories', women_id, 'Women', 6),
    ('Sale', 'women-sale', women_id, 'Women', 7)
  ON CONFLICT (slug) DO NOTHING;
END $$;
