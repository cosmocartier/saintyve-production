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
 * Falls back to the Vercel deployment URL, then localhost for local dev.
 */
export function getSiteBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}
