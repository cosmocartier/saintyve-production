import { createClient } from "@/lib/supabase/client"
import { parseCartPrice, type CartItem } from "@/contexts/cart-context"

const SESSION_STORAGE_KEY = "dd_session_id"

/**
 * Returns the anonymous session id for this browser, creating and persisting one in
 * localStorage on first use. This is not personally identifiable — it's only used to group
 * multiple checkout attempts from the same browser together for analytics.
 */
function getOrCreateSessionId(): string | null {
  if (typeof window === "undefined") return null

  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (existing) return existing

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`

    window.localStorage.setItem(SESSION_STORAGE_KEY, generated)
    return generated
  } catch {
    // localStorage can be unavailable (privacy mode, disabled storage, etc). Tracking is
    // secondary, so just skip the session id rather than breaking anything.
    return null
  }
}

/**
 * Records one "DISCUSS & ORDER IT NOW" click as a checkout attempt, with a full snapshot of
 * the cart at the moment of the click. This is fire-and-forget by design: it must never delay
 * or block the WhatsApp redirect, and any failure here should only be logged, never surfaced
 * to the customer.
 */
export async function trackCheckoutAttempt(params: {
  items: CartItem[]
  origin: string
  whatsappUrl: string
}) {
  const { items, origin, whatsappUrl } = params

  try {
    const snapshotItems = items.map((item) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      unit_price: parseCartPrice(item.price),
      variant: item.variant || null,
      variant_id: item.variantId || null,
      color: item.color || null,
      slug: item.slug || null,
      product_url: item.slug ? `${origin}/products/${item.slug}` : null,
      is_free_reward: item.isFreeReward || null,
      reward_id: item.rewardId || null,
    }))

    const totalItems = items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + parseCartPrice(item.price) * item.quantity, 0)

    const supabase = createClient()

    // Best-effort: only attach a user id if the storefront already has an authenticated
    // session. This never introduces a new auth requirement for anonymous shoppers.
    let userId: string | null = null
    try {
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id ?? null
    } catch {
      userId = null
    }

    const { error } = await supabase.from("checkout_attempts").insert({
      items: snapshotItems,
      total_items: totalItems,
      subtotal: Number(subtotal.toFixed(2)),
      currency: "EUR",
      session_id: getOrCreateSessionId(),
      user_id: userId,
      whatsapp_url: whatsappUrl,
      status: "clicked",
    })

    if (error) {
      console.error("[v0] Failed to record checkout attempt:", error.message)
    }
  } catch (err) {
    // Tracking must never break the WhatsApp checkout flow.
    console.error("[v0] Unexpected error recording checkout attempt:", err)
  }
}
