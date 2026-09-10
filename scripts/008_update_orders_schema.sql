-- Add missing columns to orders table for complete order information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Update the total column to total_amount if it exists
-- (keeping both for backward compatibility)
UPDATE public.orders SET total_amount = total WHERE total_amount IS NULL;

-- Add index for payment method queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Add check constraint for valid payment methods
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS valid_payment_method;

ALTER TABLE public.orders
ADD CONSTRAINT valid_payment_method
CHECK (payment_method IN ('bank_transfer', 'paypal'));

-- Add check constraint for valid order status
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS valid_order_status;

ALTER TABLE public.orders
ADD CONSTRAINT valid_order_status
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
