-- Factory Media: a fully separate media system from product_images_cf (gallery) and product_videos.
-- Stores additional factory photos/videos that customers can optionally view via a dedicated
-- storefront CTA instead of the default "Request additional photos" WhatsApp link.

create table if not exists product_factory_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  cf_image_id text,           -- set when media_type = 'image' (Cloudflare Images id)
  video_url text,             -- set when media_type = 'video' (Supabase Storage public URL)
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_factory_media_media_ref_check check (
    (media_type = 'image' and cf_image_id is not null) or
    (media_type = 'video' and video_url is not null)
  )
);

create index if not exists idx_product_factory_media_product_id on product_factory_media(product_id);
create index if not exists idx_product_factory_media_sort on product_factory_media(product_id, sort_order);

alter table product_factory_media enable row level security;

drop policy if exists "Public can view factory media" on product_factory_media;
create policy "Public can view factory media" on product_factory_media for select using (true);
