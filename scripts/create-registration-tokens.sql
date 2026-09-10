-- Registration tokens table
-- Each token is generated when an admin sends an invite to a private_access email.
-- The token is a UUID used as the unique slug in the registration URL.

create table if not exists public.registration_tokens (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  used        boolean not null default false,
  created_at  timestamp with time zone not null default now(),
  expires_at  timestamp with time zone not null default (now() + interval '7 days')
);

-- Index for fast lookup by id (the URL slug)
create index if not exists registration_tokens_id_idx on public.registration_tokens (id);

-- RLS
alter table public.registration_tokens enable row level security;

-- Only the service role (server-side API) can insert tokens
create policy "Service role can manage registration tokens"
  on public.registration_tokens
  for all
  using (true)
  with check (true);
