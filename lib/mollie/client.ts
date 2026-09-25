import { createMollieClient } from "@mollie/api-client"

let mollieClient: ReturnType<typeof createMollieClient> | null = null

/**
 * Singleton Mollie API client. Created lazily so builds without
 * MOLLIE_API_KEY (e.g. static analysis) don't throw at import time.
 */
export function getMollieClient() {
  if (!mollieClient) {
    const apiKey = process.env.MOLLIE_API_KEY

    if (!apiKey) {
      throw new Error("MOLLIE_API_KEY is not set")
    }

    mollieClient = createMollieClient({ apiKey })
  }

  return mollieClient
}

/**
 * Resolves the public base URL used for Mollie's redirectUrl/webhookUrl.
 *
 * NEXT_PUBLIC_SITE_URL (the real saintyve.com domain) is authoritative and should
 * always be set in production — without it, customers who finish paying on Mollie
 * get redirected to an auto-generated Vercel deployment URL instead of the real site.
 * VERCEL_PROJECT_PRODUCTION_URL (the project's stable production domain) is a safer
 * fallback than VERCEL_URL, which points at the current preview/deployment URL and
 * changes on every deploy. localhost is last, for local dev only.
 */
export function getSiteBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}
