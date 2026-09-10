-- Create newsletter_emails table
create table if not exists public.newsletter_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.newsletter_emails enable row level security;

-- Allow anyone to insert their email (no auth required for newsletter signup)
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_emails
  for insert
  with check (true);

-- Only admins can view newsletter emails
create policy "Only admins can view newsletter emails"
  on public.newsletter_emails
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create index on email for faster lookups
create index if not exists newsletter_emails_email_idx on public.newsletter_emails(email);
