-- Checkout Attempts: tracks every click on "DISCUSS & ORDER IT NOW" (the WhatsApp checkout CTA
-- in the cart drawer), together with a full snapshot of the cart at the moment of the click.
--
-- One row = one click. Do NOT create one row per product — all products the customer had in
-- their bag at that moment live inside the `items` JSONB array.
--
-- We can only ever know that the customer clicked the button and was handed off to WhatsApp.
-- We cannot currently know whether they actually pressed "Send" inside WhatsApp, so every row
-- starts as status = 'clicked'. The status column exists so a future WhatsApp Business API /
-- webhook integration can later advance it to 'message_sent' and eventually 'order_confirmed'.

create table if not exists checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Full snapshot of the cart at the moment of the click. Each element mirrors the existing
  -- CartItem shape (contexts/cart-context.tsx): product id, name, price (as displayed, e.g.
  -- "EUR 349.00"), unit_price (parsed numeric), quantity, variant/color, variantId, slug, and
  -- the resolved product_url. This is a historical snapshot — it must NOT be reconstructed
  -- later from the live products table, since prices/names/availability can change.
  items jsonb not null,

  -- Denormalized summary fields, computed from `items` at insert time, so aggregate analytics
  -- queries (totals, averages, revenue) don't need to unpack the JSONB every time.
  total_items integer not null,
  subtotal numeric(10, 2) not null,
  currency text not null default 'EUR',

  -- Anonymous browser session identifier (stored in localStorage client-side) so multiple
  -- attempts from the same browser can be grouped together. No personally identifiable
  -- information is ever collected here.
  session_id text,

  -- Only populated when the storefront already has an authenticated user at click time.
  -- Never used to introduce a new auth requirement for this feature.
  user_id uuid references auth.users(id) on delete set null,

  -- The exact generated wa.me URL for this attempt, kept for debugging/analysis.
  whatsapp_url text,

  -- clicked -> message_sent -> order_confirmed (future), or cancelled.
  -- Every row inserted by the frontend must be 'clicked' — nothing else can be verified yet.
  status text not null default 'clicked' check (status in ('clicked', 'message_sent', 'order_confirmed', 'cancelled'))
);

create index if not exists idx_checkout_attempts_created_at on checkout_attempts(created_at desc);
create index if not exists idx_checkout_attempts_status on checkout_attempts(status);
create index if not exists idx_checkout_attempts_session_id on checkout_attempts(session_id);
create index if not exists idx_checkout_attempts_user_id on checkout_attempts(user_id);
-- Speeds up "which products are most frequently abandoned" style queries over the items snapshot.
create index if not exists idx_checkout_attempts_items on checkout_attempts using gin (items jsonb_path_ops);

alter table checkout_attempts enable row level security;

-- The storefront runs as anon/unauthenticated most of the time, so it needs permission to
-- record an attempt. It must NOT be able to read, update, or delete any attempts (its own or
-- anyone else's) — analytics/admin access happens later via the service-role client, which
-- bypasses RLS entirely.
drop policy if exists "Public can insert checkout attempts" on checkout_attempts;
create policy "Public can insert checkout attempts"
  on checkout_attempts
  for insert
  with check (true);
