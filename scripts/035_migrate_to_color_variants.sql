-- Migration to support color-based variants system
-- This adds proper color tracking to product_images and enhances variant structure

-- Step 1: Ensure color columns exist in product_images table
ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS color_name TEXT,
ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Step 2: Create an index for faster color lookups
CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images(product_id, color_name);

-- Step 3: Add a constraint to ensure color_hex is valid if color_name is set
ALTER TABLE public.product_images
ADD CONSTRAINT valid_color_hex CHECK (
  color_name IS NULL OR 
  (color_hex IS NOT NULL AND color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- Step 4: Update existing "One Size" variants to be NULL (optional size)
-- This allows products with single variants to work without explicit size selection
UPDATE public.product_variants
SET size = NULL
WHERE size = 'One Size';

-- Step 5: Create index for faster variant lookups by color
CREATE INDEX IF NOT EXISTS idx_product_variants_color ON public.product_variants(product_id, color);

-- Step 6: Add unique constraint on SKU if not already exists
ALTER TABLE public.product_variants
DROP CONSTRAINT IF EXISTS product_variants_sku_key;

ALTER TABLE public.product_variants
ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);

-- Step 7: Refresh the schema
COMMENT ON COLUMN public.product_variants.color IS 'Color variant name - should match product_images.color_name for consistency';
COMMENT ON COLUMN public.product_images.color_name IS 'Color name for this product image - should match product_variants.color';
COMMENT ON COLUMN public.product_images.color_hex IS 'Hex color code (e.g., #FF0000) for display - required if color_name is set';
