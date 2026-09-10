-- Creating Editorial Favourites category for curated homepage selection
INSERT INTO categories (id, name, slug, main_category, display_order, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Editorial Favourites',
  'editorial-favourites',
  'Editorial',
  1,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;
