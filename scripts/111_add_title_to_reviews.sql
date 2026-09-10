-- Our Reviews feature: add a title to each review
-- Adds a nullable text title to public.reviews, shown above the review body.

alter table public.reviews
  add column if not exists title text;
