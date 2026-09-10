-- Drop the products_category_check constraint
-- This constraint is preventing product creation with the new category system

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check') THEN
    ALTER TABLE products DROP CONSTRAINT products_category_check;
  END IF;
END $$;
