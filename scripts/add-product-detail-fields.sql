-- Add product detail fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_details TEXT,
ADD COLUMN IF NOT EXISTS size_and_fit TEXT,
ADD COLUMN IF NOT EXISTS materials_and_care TEXT,
ADD COLUMN IF NOT EXISTS our_commitment TEXT;

-- Add comment to document the new fields
COMMENT ON COLUMN products.product_details IS 'Expandable section content for Product Details';
COMMENT ON COLUMN products.size_and_fit IS 'Expandable section content for Size & Fit';
COMMENT ON COLUMN products.materials_and_care IS 'Expandable section content for Materials & Care';
COMMENT ON COLUMN products.our_commitment IS 'Expandable section content for Our Commitment';
