-- Add status column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
CHECK (status IN ('live', 'draft'));

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Update existing products to 'live' status (so they remain visible)
UPDATE public.products SET status = 'live' WHERE status IS NULL;

-- Comment
COMMENT ON COLUMN public.products.status IS 'Product visibility status: live = visible in store, draft = hidden from store';
