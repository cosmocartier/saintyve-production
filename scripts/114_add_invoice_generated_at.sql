-- Tracks when the customer-facing invoice PDF was generated and attached to the
-- order confirmation email sent from the Mollie webhook. Mirrors the existing
-- confirmation_email_sent_at column so admins/support can see, per order, whether
-- an invoice went out — independent of whether the email itself succeeded.
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMPTZ;
