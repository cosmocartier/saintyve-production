# Saint Yve Production

Next.js 15 e-commerce platform for FlaredZone, deployed on Vercel with Supabase backend.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase
- **Email:** Resend
- **File Storage:** Vercel Blob + Cloudflare Images
- **Shipping Tracking:** 17Track
- **Package Manager:** pnpm

## Local Development

```bash
pnpm install
cp .env.example .env.local
# Fill in your environment variables in .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### 1. Import the repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `cosmocartier/flaredzone_production` from GitHub
3. Vercel auto-detects Next.js — no custom build settings needed

### 2. Configure environment variables

In **Project Settings → Environment Variables**, add all variables from `.env.example`.

**Required for production:**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_BASE_URL` | Production domain (e.g. `https://flaredzone.com`) |
| `NEXT_PUBLIC_SITE_URL` | Same as `NEXT_PUBLIC_BASE_URL` |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `WEBHOOK_SECRET` | Secret for order webhook verification |
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_IMAGES_API_TOKEN` | Cloudflare Images API token |
| `NEXT_PUBLIC_CF_IMAGE_DELIVERY_BASE` | Cloudflare image delivery URL |

### 3. Enable Vercel Blob

1. In Vercel dashboard → **Storage** → Create a **Blob** store
2. Connect it to this project — `BLOB_READ_WRITE_TOKEN` is injected automatically

### 4. Configure Supabase

1. Add your Vercel production URL to **Supabase → Authentication → URL Configuration**
2. Set Site URL and Redirect URLs to your production domain
3. Run database migrations from the `scripts/` folder against your Supabase project

### 5. Deploy

Push to `main` — Vercel deploys automatically on every push.

```bash
git push origin main
```

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/           # Next.js App Router pages and API routes
components/    # React components
lib/           # Utilities, Supabase clients, email templates
scripts/       # SQL migration scripts for Supabase
public/        # Static assets
supabase/      # Supabase Edge Functions
```
