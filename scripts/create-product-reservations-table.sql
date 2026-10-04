-- Creates the product_reservations table used by the "Reserve for 24 hours" feature
-- on the product page. Rows are only ever written via the service-role server action
-- (app/actions/create-reservation.ts) — RLS blocks all client-side access.

CREATE TABLE IF NOT EXISTS product_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_brand TEXT,
  product_url TEXT NOT NULL,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_product_reservations_product_id ON product_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reservations_status ON product_reservations(status);
CREATE INDEX IF NOT EXISTS idx_product_reservations_expires_at ON product_reservations(expires_at);

ALTER TABLE product_reservations ENABLE ROW LEVEL SECURITY;

-- No policies are created for anon/authenticated roles: with RLS enabled and
-- no permissive policy, all client-side access (select/insert/update/delete)
-- is denied by default. All reads/writes happen server-side via the
-- service-role key, which bypasses RLS entirely.
