-- Add paid status and payment date to supplier_invoices table
ALTER TABLE supplier_invoices
ADD COLUMN IF NOT EXISTS paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone;

-- Add comment
COMMENT ON COLUMN supplier_invoices.paid IS 'Whether the invoice has been paid';
COMMENT ON COLUMN supplier_invoices.payment_date IS 'When the invoice was marked as paid';
