-- Add detailed subcategories for Men and Women categories
DO $$
DECLARE
  men_tops_id UUID;
  men_bottoms_id UUID;
  men_outerwear_id UUID;
  men_shoes_id UUID;
  men_accessories_id UUID;
  
  women_tops_id UUID;
  women_bottoms_id UUID;
  women_outerwear_id UUID;
  women_shoes_id UUID;
  women_accessories_id UUID;
BEGIN
  -- Get Men category IDs
  SELECT id INTO men_tops_id FROM public.categories WHERE slug = 'men-tops';
  SELECT id INTO men_bottoms_id FROM public.categories WHERE slug = 'men-bottoms';
  SELECT id INTO men_outerwear_id FROM public.categories WHERE slug = 'men-outerwear';
  SELECT id INTO men_shoes_id FROM public.categories WHERE slug = 'men-shoes';
  SELECT id INTO men_accessories_id FROM public.categories WHERE slug = 'men-accessories';
  
  -- Get Women category IDs
  SELECT id INTO women_tops_id FROM public.categories WHERE slug = 'women-tops';
  SELECT id INTO women_bottoms_id FROM public.categories WHERE slug = 'women-bottoms';
  SELECT id INTO women_outerwear_id FROM public.categories WHERE slug = 'women-outerwear';
  SELECT id INTO women_shoes_id FROM public.categories WHERE slug = 'women-shoes';
  SELECT id INTO women_accessories_id FROM public.categories WHERE slug = 'women-accessories';
  
  -- Men Tops subcategories
  IF men_tops_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('T-Shirts', 'men-tops-tshirts', men_tops_id, 'Men', 1),
      ('Shirts', 'men-tops-shirts', men_tops_id, 'Men', 2),
      ('Hoodies', 'men-tops-hoodies', men_tops_id, 'Men', 3),
      ('Sweaters', 'men-tops-sweaters', men_tops_id, 'Men', 4),
      ('Tank Tops', 'men-tops-tank-tops', men_tops_id, 'Men', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Men Bottoms subcategories
  IF men_bottoms_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Jeans', 'men-bottoms-jeans', men_bottoms_id, 'Men', 1),
      ('Trousers', 'men-bottoms-trousers', men_bottoms_id, 'Men', 2),
      ('Shorts', 'men-bottoms-shorts', men_bottoms_id, 'Men', 3),
      ('Joggers', 'men-bottoms-joggers', men_bottoms_id, 'Men', 4),
      ('Sweatpants', 'men-bottoms-sweatpants', men_bottoms_id, 'Men', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Men Outerwear subcategories
  IF men_outerwear_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Jackets', 'men-outerwear-jackets', men_outerwear_id, 'Men', 1),
      ('Coats', 'men-outerwear-coats', men_outerwear_id, 'Men', 2),
      ('Blazers', 'men-outerwear-blazers', men_outerwear_id, 'Men', 3),
      ('Vests', 'men-outerwear-vests', men_outerwear_id, 'Men', 4),
      ('Parkas', 'men-outerwear-parkas', men_outerwear_id, 'Men', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Men Shoes subcategories
  IF men_shoes_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Sneakers', 'men-shoes-sneakers', men_shoes_id, 'Men', 1),
      ('Boots', 'men-shoes-boots', men_shoes_id, 'Men', 2),
      ('Sandals', 'men-shoes-sandals', men_shoes_id, 'Men', 3),
      ('Loafers', 'men-shoes-loafers', men_shoes_id, 'Men', 4),
      ('Formal', 'men-shoes-formal', men_shoes_id, 'Men', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Men Accessories subcategories
  IF men_accessories_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Bags', 'men-accessories-bags', men_accessories_id, 'Men', 1),
      ('Hats', 'men-accessories-hats', men_accessories_id, 'Men', 2),
      ('Belts', 'men-accessories-belts', men_accessories_id, 'Men', 3),
      ('Wallets', 'men-accessories-wallets', men_accessories_id, 'Men', 4),
      ('Sunglasses', 'men-accessories-sunglasses', men_accessories_id, 'Men', 5),
      ('Jewelry', 'men-accessories-jewelry', men_accessories_id, 'Men', 6)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Women Tops subcategories
  IF women_tops_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('T-Shirts', 'women-tops-tshirts', women_tops_id, 'Women', 1),
      ('Shirts', 'women-tops-shirts', women_tops_id, 'Women', 2),
      ('Hoodies', 'women-tops-hoodies', women_tops_id, 'Women', 3),
      ('Sweaters', 'women-tops-sweaters', women_tops_id, 'Women', 4),
      ('Tank Tops', 'women-tops-tank-tops', women_tops_id, 'Women', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Women Bottoms subcategories
  IF women_bottoms_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Jeans', 'women-bottoms-jeans', women_bottoms_id, 'Women', 1),
      ('Trousers', 'women-bottoms-trousers', women_bottoms_id, 'Women', 2),
      ('Shorts', 'women-bottoms-shorts', women_bottoms_id, 'Women', 3),
      ('Joggers', 'women-bottoms-joggers', women_bottoms_id, 'Women', 4),
      ('Sweatpants', 'women-bottoms-sweatpants', women_bottoms_id, 'Women', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Women Outerwear subcategories
  IF women_outerwear_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Jackets', 'women-outerwear-jackets', women_outerwear_id, 'Women', 1),
      ('Coats', 'women-outerwear-coats', women_outerwear_id, 'Women', 2),
      ('Blazers', 'women-outerwear-blazers', women_outerwear_id, 'Women', 3),
      ('Vests', 'women-outerwear-vests', women_outerwear_id, 'Women', 4),
      ('Parkas', 'women-outerwear-parkas', women_outerwear_id, 'Women', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Women Shoes subcategories
  IF women_shoes_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Sneakers', 'women-shoes-sneakers', women_shoes_id, 'Women', 1),
      ('Boots', 'women-shoes-boots', women_shoes_id, 'Women', 2),
      ('Sandals', 'women-shoes-sandals', women_shoes_id, 'Women', 3),
      ('Loafers', 'women-shoes-loafers', women_shoes_id, 'Women', 4),
      ('Formal', 'women-shoes-formal', women_shoes_id, 'Women', 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  -- Women Accessories subcategories
  IF women_accessories_id IS NOT NULL THEN
    INSERT INTO public.categories (name, slug, parent_id, main_category, display_order) VALUES
      ('Bags', 'women-accessories-bags', women_accessories_id, 'Women', 1),
      ('Hats', 'women-accessories-hats', women_accessories_id, 'Women', 2),
      ('Belts', 'women-accessories-belts', women_accessories_id, 'Women', 3),
      ('Wallets', 'women-accessories-wallets', women_accessories_id, 'Women', 4),
      ('Sunglasses', 'women-accessories-sunglasses', women_accessories_id, 'Women', 5),
      ('Jewelry', 'women-accessories-jewelry', women_accessories_id, 'Women', 6)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;
