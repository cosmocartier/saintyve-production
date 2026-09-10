-- Fix the order status check constraint to use 'completed' instead of 'delivered'
-- This aligns with the admin interface expectations

-- Drop the existing constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS valid_order_status;

-- Add the updated constraint with 'completed' instead of 'delivered'
ALTER TABLE public.orders
ADD CONSTRAINT valid_order_status
CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));

-- Update any existing 'delivered' or 'shipped' statuses to 'completed'
UPDATE public.orders
SET status = 'completed'
WHERE status IN ('delivered', 'shipped');
