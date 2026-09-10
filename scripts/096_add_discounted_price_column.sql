-- Add discounted_price column to products table
-- NULL = no discount; a value = product is on sale at that price
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discounted_price numeric;

COMMENT ON COLUMN products.discounted_price IS 'Optional discounted/sale price. NULL means no discount is active.';
