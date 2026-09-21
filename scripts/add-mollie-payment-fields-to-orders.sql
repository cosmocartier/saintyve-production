-- Add Mollie payment tracking fields to orders and allow "mollie" as a payment method

alter table public.orders
  add column if not exists mollie_payment_id text,
  add column if not exists payment_status text;

alter table public.orders
  drop constraint if exists valid_payment_method;

alter table public.orders
  add constraint valid_payment_method
  check (payment_method = any (array['bank_transfer'::text, 'paypal'::text, 'mollie'::text]));

create index if not exists orders_mollie_payment_id_idx on public.orders (mollie_payment_id);
