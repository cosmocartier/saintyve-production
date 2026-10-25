"use server"

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { getCheckoutMode, MANUAL_ORDER_PAYMENT_STATUS, type CheckoutMode } from "@/lib/checkout-mode"

const CREDIT_VALUE_EUR = 0.89
const MAX_LINE_ITEMS = 50
const MAX_QUANTITY = 20
const DEDUPE_WINDOW_MS = 10 * 60 * 1000

export interface ManualOrderPayload {
  items: { id: string; variantId?: string | null; quantity: number; price: string; rewardId?: string | null }[]
  customer: {
    email: string
    phone: string
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  couponId: string | null
  creditsToApply: number
}

export type ManualOrderResult = { success: true; orderId: string } | { success: false; error: string }

const GENERIC_ERROR = "We couldn't submit your order. Please try again."

export async function getCheckoutModeAction(): Promise<CheckoutMode> {
  return getCheckoutMode()
}

function parsePrice(price: string): number {
  return Number.parseFloat(String(price).replace(/€|EUR/g, "").replace(/,/g, "").trim())
}

function itemSignature(items: { product_id: string; variant_id: string | null; quantity: number }[]) {
  return items
    .map((item) => `${item.product_id}|${item.variant_id ?? ""}|${item.quantity}`)
    .sort()
    .join(";")
}

export async function submitManualOrder(payload: ManualOrderPayload): Promise<ManualOrderResult> {
  if (getCheckoutMode() !== "manual") {
    return { success: false, error: "Manual order submission is not enabled." }
  }

  try {
    const { items, customer } = payload

    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINE_ITEMS) {
      return { success: false, error: "Your cart is empty. Please add items before checkout." }
    }

    const email = customer.email?.trim()
    const requiredFields = [customer.fullName, customer.phone, customer.address, customer.city, customer.postalCode, customer.country]
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || requiredFields.some((value) => !value?.trim())) {
      return { success: false, error: "Please complete your contact and shipping details." }
    }

    const lines = items.map((item) => ({
      product_id: item.id,
      variant_id: item.variantId || null,
      quantity: item.quantity,
      price: parsePrice(item.price),
    }))

    const invalidLine = lines.find(
      (line) =>
        !line.product_id ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > MAX_QUANTITY ||
        !Number.isFinite(line.price) ||
        line.price < 0,
    )
    if (invalidLine) {
      return { success: false, error: "One of the items in your cart is invalid. Please review your cart." }
    }

    const admin = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Never trust a client-supplied user id: resolve it from the session.
    const sessionClient = await createClient()
    const {
      data: { user },
    } = await sessionClient.auth.getUser()
    const userId = user?.id ?? null

    // Every product must exist and every variant must belong to its product.
    const productIds = Array.from(new Set(lines.map((line) => line.product_id)))
    const { data: products, error: productsError } = await admin.from("products").select("id").in("id", productIds)
    if (productsError || (products?.length ?? 0) !== productIds.length) {
      return { success: false, error: "One of the items in your cart is no longer available." }
    }

    const variantIds = Array.from(new Set(lines.map((line) => line.variant_id).filter((id): id is string => Boolean(id))))
    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await admin
        .from("product_variants")
        .select("id, product_id")
        .in("id", variantIds)
      const variantOwner = new Map((variants ?? []).map((variant) => [variant.id, variant.product_id]))
      const mismatch = lines.some((line) => line.variant_id && variantOwner.get(line.variant_id) !== line.product_id)
      if (variantsError || mismatch) {
        return { success: false, error: "One of the items in your cart is no longer available." }
      }
    }

    // Totals are recomputed here rather than taken from the browser.
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

    let discount = 0
    let couponCode: string | null = null
    let coupon: any = null
    if (payload.couponId) {
      const { data: couponRow } = await admin
        .from("coupons")
        .select("*")
        .eq("id", payload.couponId)
        .eq("enabled", true)
        .single()

      const now = new Date()
      const couponError = !couponRow
        ? "This promo code is no longer valid."
        : couponRow.valid_from && new Date(couponRow.valid_from) > now
          ? "This promo code is not yet valid."
          : couponRow.valid_until && new Date(couponRow.valid_until) < now
            ? "This promo code has expired."
            : couponRow.minimum_order_value && subtotal < couponRow.minimum_order_value
              ? `Minimum order value of EUR ${Number(couponRow.minimum_order_value).toFixed(2)} required.`
              : couponRow.usage_limit && couponRow.times_used >= couponRow.usage_limit
                ? "This promo code has reached its usage limit."
                : couponRow.user_email && couponRow.user_email !== email
                  ? "This promo code is not valid for your account."
                  : null

      if (couponError) return { success: false, error: couponError }

      coupon = couponRow
      couponCode = couponRow.code
      discount =
        couponRow.discount_type === "percentage"
          ? (subtotal * couponRow.discount_value) / 100
          : Number(couponRow.discount_value)
    }

    let creditsToApply = 0
    if (userId && Number.isInteger(payload.creditsToApply) && payload.creditsToApply > 0) {
      const { data: profile } = await admin.from("profiles").select("credits").eq("id", userId).single()
      const available = profile?.credits ?? 0
      creditsToApply = Math.min(payload.creditsToApply, available, Math.floor(subtotal / CREDIT_VALUE_EUR))
    }

    const creditsDiscount = creditsToApply * CREDIT_VALUE_EUR
    const total = Math.max(0, subtotal - discount - creditsDiscount)

    // Duplicate protection: a double click, retry or resubmit of the same cart within a few
    // minutes returns the order that was already saved instead of creating another one.
    const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString()
    const { data: recentOrders } = await admin
      .from("orders")
      .select("id, total_amount, order_items(product_id, variant_id, quantity)")
      .eq("customer_email", email)
      .eq("status", "pending")
      .eq("payment_status", MANUAL_ORDER_PAYMENT_STATUS)
      .gte("created_at", since)

    const signature = itemSignature(lines)
    const duplicate = (recentOrders ?? []).find(
      (order: any) =>
        Math.abs(Number(order.total_amount) - total) < 0.005 && itemSignature(order.order_items ?? []) === signature,
    )
    if (duplicate) {
      return { success: true, orderId: duplicate.id }
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        payment_method: "mollie",
        payment_status: MANUAL_ORDER_PAYMENT_STATUS,
        total,
        subtotal_amount: subtotal,
        shipping_amount: 0,
        tax_amount: 0,
        total_amount: total,
        discount_amount: discount + creditsDiscount,
        coupon_code: couponCode,
        credits_applied: creditsToApply,
        customer_email: email,
        customer_phone: customer.phone.trim(),
        customer_name: customer.fullName.trim(),
        shipping_address: {
          email,
          phone: customer.phone.trim(),
          fullName: customer.fullName.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          postalCode: customer.postalCode.trim(),
          country: customer.country.trim(),
        },
        // No reservation window: the team confirms stock manually, so the order must not auto-expire.
        reserved_until: null,
        storefront: "saintyve.com",
      })
      .select("id")
      .single()

    if (orderError || !order) {
      console.error("[v0] Manual order insert failed:", orderError)
      return { success: false, error: GENERIC_ERROR }
    }

    const { error: itemsError } = await admin.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.product_id,
        variant_id: line.variant_id,
        quantity: line.quantity,
        price: line.price,
      })),
    )

    if (itemsError) {
      console.error("[v0] Manual order items insert failed:", itemsError)
      await admin.from("orders").delete().eq("id", order.id)
      return { success: false, error: GENERIC_ERROR }
    }

    // The order is safely stored from here on. The steps below mirror the existing checkout and
    // are logged rather than failing the order.
    if (coupon) {
      const { error: usageCountError } = await admin
        .from("coupons")
        .update({ times_used: coupon.times_used + 1 })
        .eq("id", coupon.id)
      if (usageCountError) console.error("[v0] Coupon usage count update failed:", usageCountError)

      const { error: usageError } = await admin.from("coupon_usage").insert({
        coupon_id: coupon.id,
        user_id: userId,
        order_id: order.id,
        discount_amount: discount,
      })
      if (usageError) console.error("[v0] Coupon usage record failed:", usageError)
    }

    if (userId && creditsToApply > 0) {
      const { data: profile } = await admin.from("profiles").select("credits").eq("id", userId).single()
      const { error: creditsError } = await admin
        .from("profiles")
        .update({ credits: Math.max(0, (profile?.credits ?? 0) - creditsToApply) })
        .eq("id", userId)
      if (creditsError) console.error("[v0] Credits deduction failed:", creditsError)
    }

    const rewardIds = items.map((item) => item.rewardId).filter((id): id is string => Boolean(id))
    if (userId && rewardIds.length > 0) {
      const { error: rewardError } = await admin
        .from("loyalty_user_rewards")
        .update({ used_in_order_id: order.id })
        .in("id", rewardIds)
        .eq("user_id", userId)
      if (rewardError) console.error("[v0] Reward update failed:", rewardError)
    }

    // Deliberately no payment or confirmation email here: nothing has been paid.
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("[v0] Unexpected error submitting manual order:", error)
    return { success: false, error: GENERIC_ERROR }
  }
}
