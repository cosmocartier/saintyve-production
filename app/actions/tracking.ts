"use server"

import { createClient } from "@/lib/supabase/server"
import { registerTrackingNumbers, buildRecipientAddress, getPhoneLast4 } from "@/lib/17track"

export async function updateOrderItemTrackingAction(input: {
  orderItemId: string
  trackingNumber: string
  courier?: string
  carrierCode?: string | number
}) {
  console.log("[v0] updateOrderItemTrackingAction called with:", input)

  const supabase = await createClient()

  const { data: orderItem, error: fetchError } = await supabase
    .from("order_items")
    .select(`
      *,
      orders!inner(
        id,
        created_at,
        shipping_address,
        customer_name,
        customer_phone
      )
    `)
    .eq("id", input.orderItemId)
    .single()

  if (fetchError || !orderItem) {
    console.error("[v0] Failed to fetch order item:", fetchError)
    throw new Error("Failed to fetch order item")
  }

  const order = orderItem.orders as any

  // 1) Update DB with tracking info and set status to pending
  const { error: updateError } = await supabase
    .from("order_items")
    .update({
      tracking_number: input.trackingNumber,
      courier: input.courier || null,
      tracking_carrier_code: input.carrierCode ? Number(input.carrierCode) : null,
      tracking_registered_at: new Date().toISOString(),
      tracking_17track_tag: input.orderItemId,
      tracking_sync_status: "pending",
    })
    .eq("id", input.orderItemId)

  if (updateError) {
    console.error("[v0] Failed to update order item tracking in DB:", updateError)
    throw new Error("Failed to update order item tracking in database")
  }

  console.log("[v0] Order item tracking updated in DB, now building rich 17TRACK payload...")

  try {
    // Extract shipping address from orders.shipping_address (jsonb)
    const shippingAddress = order.shipping_address || {}

    // Build human-friendly order reference (use first 8 chars of UUID)
    const orderReference = `Order #${order.id.slice(0, 8).toUpperCase()}`

    // Build recipient address
    const recipientAddress = buildRecipientAddress({
      country: shippingAddress.country,
      state: shippingAddress.state,
      city: shippingAddress.city,
      address: shippingAddress.address,
      apartment: shippingAddress.apartment,
      postalCode: shippingAddress.postalCode,
    })

    // Get consignee name (prefer customer_name, fallback to fullName or combine first+last)
    let consignee: string | null = null
    if (order.customer_name) {
      consignee = order.customer_name
    } else if (shippingAddress.fullName) {
      consignee = shippingAddress.fullName
    } else if (shippingAddress.firstName || shippingAddress.lastName) {
      const parts = [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean)
      consignee = parts.join(" ") || null
    }

    // Get phone last 4 digits
    const phoneLast4 = getPhoneLast4(order.customer_phone || shippingAddress.phone)

    // Extract ship_date from order.created_at (YYYY-MM-DD format)
    const shipDate = order.created_at ? order.created_at.split("T")[0] : null

    // Build the enriched payload
    const enrichedPayload = {
      number: input.trackingNumber,
      carrier: input.carrierCode ? Number(input.carrierCode) : undefined,
      tag: input.orderItemId,
      // Only include track_info if we have data
      ...(recipientAddress || orderReference
        ? {
            track_info: {
              ...(recipientAddress
                ? {
                    shipping_info: {
                      recipient_address: recipientAddress,
                    },
                  }
                : {}),
              ...(orderReference
                ? {
                    misc_info: {
                      customer_number: orderReference,
                      reference_number: orderReference,
                    },
                  }
                : {}),
            },
          }
        : {}),
      // Top-level hints (only include if we have values)
      ...(shippingAddress.postalCode ? { destination_postal_code: shippingAddress.postalCode } : {}),
      ...(shippingAddress.country ? { destination_country: shippingAddress.country } : {}),
      ...(shippingAddress.city ? { destination_city: shippingAddress.city } : {}),
      ...(shipDate ? { ship_date: shipDate } : {}),
      ...(consignee ? { consignee } : {}),
      ...(phoneLast4 ? { phone_number_last_4: phoneLast4 } : {}),
    }

    console.log("[v0] Enriched 17TRACK payload:", JSON.stringify(enrichedPayload, null, 2))

    await registerTrackingNumbers([enrichedPayload])

    // Update sync status to synced
    await supabase.from("order_items").update({ tracking_sync_status: "synced" }).eq("id", input.orderItemId)

    console.log("[v0] 17TRACK registration successful for order item:", input.orderItemId)

    return { success: true }
  } catch (err) {
    // Update sync status to failed
    await supabase.from("order_items").update({ tracking_sync_status: "failed" }).eq("id", input.orderItemId)

    console.error("[v0] 17TRACK register failed:", err)

    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to sync tracking with 17TRACK.",
    }
  }
}
