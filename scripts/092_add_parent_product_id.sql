-- Add parent_product_id column to products table for variant grouping
ALTER TABLE products
ADD COLUMN parent_product_id UUID NULL;

-- Add foreign key constraint (self-reference)
ALTER TABLE products
ADD CONSTRAINT fk_parent_product
FOREIGN KEY (parent_product_id)
REFERENCES products(id)
ON DELETE SET NULL;

-- Add check constraint to prevent circular references
ALTER TABLE products
ADD CONSTRAINT check_no_self_reference
CHECK (parent_product_id IS NULL OR parent_product_id != id);

-- Add index for fast lookups of variant groups
CREATE INDEX idx_products_parent_product_id ON products(parent_product_id);

-- Add index for queries that need both parent and children
CREATE INDEX idx_products_parent_lookup ON products(id, parent_product_id) WHERE parent_product_id IS NOT NULL;
