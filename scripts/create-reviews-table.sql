-- Our Reviews feature: reviews table
-- Reuses the existing public.products table via product_id (nullable FK).

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  review_date date not null,
  review text not null,
  country text not null,
  product_id uuid references public.products(id) on delete set null,
  published boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- Indexes for the query patterns the panel uses (published feed, sorting, product join)
create index if not exists reviews_published_idx on public.reviews (published);
create index if not exists reviews_review_date_idx on public.reviews (review_date);
create index if not exists reviews_product_id_idx on public.reviews (product_id);

-- Row Level Security
alter table public.reviews enable row level security;

-- Public visitors can read only published reviews
drop policy if exists "Anyone can read published reviews" on public.reviews;
create policy "Anyone can read published reviews"
  on public.reviews
  for select
  using (published = true);

-- Admins can fully manage reviews (matches the admin pattern used by other tables, e.g. profiles.role = 'admin')
drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
  on public.reviews
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Example development-only inserts (commented out — do not run against production data)
-- insert into public.reviews (customer_name, review_date, review, country, product_id, published) values
--   ('Sophie M.', '2025-01-14', 'The quality completely exceeded my expectations. Packaging felt premium and the fit was perfect.', 'FR', (select id from public.products limit 1), true),
--   ('James O.', '2024-12-02', 'Fast shipping and the material feels exactly like the original. Will be ordering again.', 'GB', null, true),
--   ('Amara K.', '2024-11-20', 'Customer service was excellent when I had a sizing question. Very happy with my order.', 'DE', (select id from public.products limit 1), true);
