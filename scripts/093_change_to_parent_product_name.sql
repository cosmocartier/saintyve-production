-- Remove the old parent_product_id column and constraints
ALTER TABLE products
DROP CONSTRAINT IF EXISTS fk_parent_product;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_no_self_reference;

DROP INDEX IF EXISTS idx_products_parent_product_id;
DROP INDEX IF EXISTS idx_products_parent_lookup;

ALTER TABLE products
DROP COLUMN IF EXISTS parent_product_id;

-- Add parent_product_name column (text field)
ALTER TABLE products
ADD COLUMN parent_product_name TEXT NULL;

-- Add index for fast variant group lookups
CREATE INDEX idx_products_parent_product_name ON products(parent_product_name) WHERE parent_product_name IS NOT NULL;

-- Add index for product listing queries
CREATE INDEX idx_products_name_parent_name ON products(name, parent_product_name);
