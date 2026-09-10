-- Add heel_height_cm column to products table
-- This is useful for women's heels and other footwear with heels

ALTER TABLE products
ADD COLUMN IF NOT EXISTS heel_height_cm DECIMAL(4,1);

COMMENT ON COLUMN products.heel_height_cm IS 'Heel height in centimeters (e.g., 8.5 for 8.5cm heel)';
