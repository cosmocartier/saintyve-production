-- Our Reviews feature: add star rating to reviews
-- Adds an integer rating (1-5) to public.reviews, defaulting existing rows to 5.

alter table public.reviews
  add column if not exists rating integer not null default 5;

-- Backfill safety net: any pre-existing rows without the default applied (shouldn't happen with
-- the DEFAULT clause above, but kept for idempotency/safety) are set to 5 stars.
update public.reviews set rating = 5 where rating is null;

-- Enforce the 1-5 range at the database level.
alter table public.reviews
  drop constraint if exists reviews_rating_range;

alter table public.reviews
  add constraint reviews_rating_range check (rating >= 1 and rating <= 5);
