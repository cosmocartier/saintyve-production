-- Add coupon-related fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Create index for faster coupon code lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code);

-- Add comment to explain the fields
COMMENT ON COLUMN public.orders.discount_amount IS 'Total discount applied from coupon';
COMMENT ON COLUMN public.orders.coupon_code IS 'Coupon code used for this order';
