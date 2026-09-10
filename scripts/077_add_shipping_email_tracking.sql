-- Add tracking email sent timestamp and shipped timestamp to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Add comment
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when order was marked as shipped by supplier';
COMMENT ON COLUMN public.orders.tracking_email_sent_at IS 'Timestamp when tracking email was sent to customer';
COMMENT ON COLUMN public.orders.tracking_url IS 'Direct URL to track the shipment';

-- Create index for email tracking
CREATE INDEX IF NOT EXISTS idx_orders_tracking_email_sent ON public.orders(tracking_email_sent_at);
