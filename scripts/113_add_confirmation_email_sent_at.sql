-- Tracks whether the customer-facing order confirmation email has already been sent.
-- Used as an idempotency guard so a duplicate Mollie webhook delivery (or a retried
-- confirmation request) can never result in the customer receiving more than one
-- "payment received" email for the same order.
alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;
