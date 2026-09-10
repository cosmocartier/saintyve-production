-- Add retail_price column to products table
ALTER TABLE products
ADD COLUMN retail_price numeric;

-- Add comment to explain the column
COMMENT ON COLUMN products.retail_price IS 'Manufacturer suggested retail price (MSRP) for comparison';
