-- Add payment_proof_url column to orders table to store payment proof images
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_proof_url text;

COMMENT ON COLUMN public.orders.payment_proof_url IS 'URL to uploaded payment proof image for manual transfer orders';
