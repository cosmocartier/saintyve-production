-- Add tracking fields to orders table (for order-level tracking)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier TEXT;

-- Add tracking fields to order_items table (for item-level tracking)
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier TEXT;

-- Create index for tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_order_items_tracking ON public.order_items(tracking_number);

-- Add comment to explain the tracking system
COMMENT ON COLUMN public.orders.tracking_number IS 'Tracking number for the entire order (if all items ship together)';
COMMENT ON COLUMN public.orders.courier IS 'Courier service for the entire order (DHL, FedEx, UPS, etc.)';
COMMENT ON COLUMN public.order_items.tracking_number IS 'Tracking number for individual item (if items ship separately)';
COMMENT ON COLUMN public.order_items.courier IS 'Courier service for individual item';
