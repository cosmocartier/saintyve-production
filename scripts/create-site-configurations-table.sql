-- Scalable site-wide configuration/toggle system.
-- Each row is one independently controllable configuration (e.g. "retail_prices",
-- "landing_page"). New configurations only need a new row here — no schema change.
create table if not exists site_configurations (
  key text primary key,
  label text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into site_configurations (key, label, enabled)
values
  ('retail_prices', 'Retail Prices', false),
  ('landing_page', 'Landing Page', false)
on conflict (key) do nothing;

-- Locked down: only the server (service role) reads/writes this table.
-- No anon/authenticated policies are defined, so RLS denies all client access.
alter table site_configurations enable row level security;
