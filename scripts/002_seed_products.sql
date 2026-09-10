-- Seed initial products from the existing hardcoded data
-- Using proper UUID format instead of simple integers
INSERT INTO public.products (id, slug, name, description, price, category, image)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'nike-zoomx-vomero-plus',
    'Nike ZoomX Vomero Plus',
    'Premium running shoes with ZoomX foam technology',
    180.00,
    'RUNNING SHOES',
    '/products/nike-vomero.jpeg'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'nike-club-cap',
    'Nike Club Cap',
    'Classic baseball cap with Nike logo',
    25.00,
    'ACCESSORIES',
    '/products/nike-cap.jpeg'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'nike-tech-woven-pants',
    'Nike Tech Woven Pants',
    'Camo tracksuit with modern tech fabric',
    120.00,
    'MEN''S PANTS',
    '/products/nike-tech-set.jpeg'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'jordan-fleece-hoodie',
    'Jordan Fleece Hoodie',
    'Premium hoodie with signature graphics',
    85.00,
    'MEN''S HOODIE',
    '/products/jordan-hoodie.jpeg'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed product variants (sizes for shoes and clothing)
-- Updated product_id references to use proper UUID format
INSERT INTO public.product_variants (product_id, size, sku, stock_quantity)
VALUES
  -- Nike ZoomX Vomero Plus sizes
  ('00000000-0000-0000-0000-000000000001', 'US 7', 'NIKE-VOMERO-US7', 15),
  ('00000000-0000-0000-0000-000000000001', 'US 8', 'NIKE-VOMERO-US8', 20),
  ('00000000-0000-0000-0000-000000000001', 'US 9', 'NIKE-VOMERO-US9', 25),
  ('00000000-0000-0000-0000-000000000001', 'US 10', 'NIKE-VOMERO-US10', 30),
  ('00000000-0000-0000-0000-000000000001', 'US 11', 'NIKE-VOMERO-US11', 20),
  ('00000000-0000-0000-0000-000000000001', 'US 12', 'NIKE-VOMERO-US12', 15),
  
  -- Nike Club Cap (one size)
  ('00000000-0000-0000-0000-000000000002', 'One Size', 'NIKE-CAP-OS', 50),
  
  -- Nike Tech Woven Pants sizes
  ('00000000-0000-0000-0000-000000000003', 'S', 'NIKE-TECH-PANTS-S', 10),
  ('00000000-0000-0000-0000-000000000003', 'M', 'NIKE-TECH-PANTS-M', 15),
  ('00000000-0000-0000-0000-000000000003', 'L', 'NIKE-TECH-PANTS-L', 20),
  ('00000000-0000-0000-0000-000000000003', 'XL', 'NIKE-TECH-PANTS-XL', 15),
  ('00000000-0000-0000-0000-000000000003', 'XXL', 'NIKE-TECH-PANTS-XXL', 10),
  
  -- Jordan Fleece Hoodie sizes
  ('00000000-0000-0000-0000-000000000004', 'S', 'JORDAN-HOODIE-S', 12),
  ('00000000-0000-0000-0000-000000000004', 'M', 'JORDAN-HOODIE-M', 18),
  ('00000000-0000-0000-0000-000000000004', 'L', 'JORDAN-HOODIE-L', 22),
  ('00000000-0000-0000-0000-000000000004', 'XL', 'JORDAN-HOODIE-XL', 18),
  ('00000000-0000-0000-0000-000000000004', 'XXL', 'JORDAN-HOODIE-XXL', 12)
ON CONFLICT (sku) DO NOTHING;
