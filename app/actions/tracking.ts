"use server"

import { createClient } from "@/lib/supabase/server"

// NOTE: 17TRACK integration is intentionally disconnected for now. We are not currently
// using 17TRACK, but may re-enable it in the future — see lib/17track.ts for the API
// client that this action used to call. Tracking numbers are stored locally only.
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
    .select("id")
    .eq("id", input.orderItemId)
    .single()

  if (fetchError || !orderItem) {
    console.error("[v0] Failed to fetch order item:", fetchError)
    throw new Error("Failed to fetch order item")
  }

  // Save tracking info locally. 17TRACK sync is disabled, so we mark it as
  // "not_synced" rather than attempting to register with the external API.
  const { error: updateError } = await supabase
    .from("order_items")
    .update({
      tracking_number: input.trackingNumber,
      courier: input.courier || null,
      tracking_carrier_code: input.carrierCode ? Number(input.carrierCode) : null,
      tracking_registered_at: new Date().toISOString(),
      tracking_sync_status: "not_synced",
    })
    .eq("id", input.orderItemId)

  if (updateError) {
    console.error("[v0] Failed to update order item tracking in DB:", updateError)
    return { success: false, error: "Failed to update order item tracking in database" }
  }

  console.log("[v0] Order item tracking saved locally (17TRACK sync disabled):", input.orderItemId)

  return { success: true }
}
