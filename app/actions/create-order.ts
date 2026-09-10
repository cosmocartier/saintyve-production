"use server"

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderLineItem {
  product_id: string
  variant_id: string | null
  quantity: number
  /** Unit price in EUR — admin may override from the product default */
  price: number
}

export interface CreateOrderPayload {
  // Customer
  customer_email: string
  customer_name: string
  customer_phone: string | null
  /** UUID of existing profile — null for a manual guest order */
  user_id: string | null

  // Shipping address stored as JSONB (same shape as checkout)
  shipping_address: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    apartment: string
    city: string
    state: string
    postalCode: string
    country: string
  }

  // Line items
  items: OrderLineItem[]

  // Pricing
  subtotal_amount: number
  shipping_amount: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  total: number

  // Coupon
  coupon_code: string | null
  coupon_id: string | null
  coupon_discount: number

  // Credits
  credits_applied: number

  // Payment
  /** Must match existing values in the orders table: bank_transfer | paypal | stripe | cash | manual | other */
  payment_method: string
  /** Order status: pending | processing | completed | cancelled */
  status: string

  // Fulfillment
  /** supplier_status: unprocessed | preparing | in_transit | delivered */
  supplier_status: string | null

  // Internal notes stored in delivery_notes (existing column)
  internal_notes: string | null
}

export interface CreateOrderResult {
  success: boolean
  orderId?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Coupon validation helper — replicates checkout logic exactly
// ---------------------------------------------------------------------------

export async function validateCoupon(
  code: string,
  subtotal: number,
  customerEmail: string,
): Promise<{ valid: boolean; coupon?: any; error?: string }> {
  const supabase = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("enabled", true)
    .single()

  if (error || !coupon) return { valid: false, error: "Coupon not found or inactive" }

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now)
    return { valid: false, error: "Coupon is not yet valid" }
  if (coupon.valid_until && new Date(coupon.valid_until) < now)
    return { valid: false, error: "Coupon has expired" }
  if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value)
    return { valid: false, error: `Minimum order value EUR ${coupon.minimum_order_value.toFixed(2)} required` }
  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit)
    return { valid: false, error: "Coupon usage limit reached" }
  if (coupon.user_email && coupon.user_email !== customerEmail)
    return { valid: false, error: "Coupon is restricted to a specific email" }

  return { valid: true, coupon }
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export async function createOrderAction(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  // Use service-role client so this can run from a Server Action
  const supabase = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 1. Validate items
  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: "Order must contain at least one item" }
  }

  // 2. Insert order — exact same column set as checkout handlePlaceOrder
  const reservedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: payload.user_id,
      status: payload.status,
      payment_method: payload.payment_method,
      total: payload.total,
      subtotal_amount: payload.subtotal_amount,
      shipping_amount: payload.shipping_amount,
      tax_amount: payload.tax_amount,
      total_amount: payload.total_amount,
      discount_amount: payload.discount_amount,
      coupon_code: payload.coupon_code,
      credits_applied: payload.credits_applied,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      customer_name: payload.customer_name,
      shipping_address: payload.shipping_address,
      supplier_status: payload.supplier_status,
      delivery_notes: payload.internal_notes,
      reserved_until: reservedUntil,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error("[v0] createOrderAction: order insert failed", orderError)
    return { success: false, error: orderError?.message ?? "Failed to create order" }
  }

  // 3. Insert order_items
  const orderItemsToInsert = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert)

  if (itemsError) {
    console.error("[v0] createOrderAction: order_items insert failed", itemsError)
    // Roll back
    await supabase.from("orders").delete().eq("id", order.id)
    return { success: false, error: itemsError.message }
  }

  // 4. Coupon tracking (mirrors checkout)
  if (payload.coupon_id && payload.coupon_code) {
    // Increment times_used
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("times_used")
      .eq("id", payload.coupon_id)
      .single()

    if (existingCoupon) {
      await supabase
        .from("coupons")
        .update({ times_used: existingCoupon.times_used + 1 })
        .eq("id", payload.coupon_id)
    }

    await supabase.from("coupon_usage").insert({
      coupon_id: payload.coupon_id,
      user_id: payload.user_id,
      order_id: order.id,
      discount_amount: payload.coupon_discount,
    })
  }

  // 5. Deduct credits if applied
  if (payload.user_id && payload.credits_applied > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", payload.user_id)
      .single()

    if (profile) {
      await supabase
        .from("profiles")
        .update({ credits: Math.max(0, profile.credits - payload.credits_applied) })
        .eq("id", payload.user_id)
    }
  }

  // 6. Fire confirmation email in background (non-blocking)
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}/api/orders/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: order.id }),
  }).catch(() => {})

  return { success: true, orderId: order.id }
}
