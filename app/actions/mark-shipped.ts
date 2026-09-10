"use server"

import { createClient } from "@/lib/supabase/server"
import { sendShippingNotificationEmail } from "@/lib/shipping-notification-email"

export async function markOrderAsShippedAction({
  orderId,
  trackingUrl,
}: {
  orderId: string
  trackingUrl?: string
}) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Fetch order with items to verify permissions and get tracking data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items!inner (
          id,
          quantity,
          price,
          tracking_number,
          courier,
          products (
            id,
            name,
            slug
          ),
          product_variants (
            size,
            color
          )
        )
      `,
      )
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[v0] Error fetching order:", orderError)
      return { success: false, error: "Order not found" }
    }

    // Verify all items have tracking numbers
    const allItemsHaveTracking = order.order_items.every(
      (item: any) => item.tracking_number && item.tracking_number.trim() !== "",
    )

    if (!allItemsHaveTracking) {
      return { success: false, error: "All items must have tracking numbers before marking as shipped" }
    }

    // Get tracking info from first item (assuming all items ship together or use same carrier)
    const firstItem = order.order_items[0]
    const trackingInfo = {
      carrier: firstItem.courier || "DHL",
      trackingNumber: firstItem.tracking_number,
      trackingUrl: trackingUrl || `https://www.17track.net/en/track?nums=${firstItem.tracking_number}`,
    }

    // Check if email was already sent
    if (order.tracking_email_sent_at) {
      console.log("[v0] Shipping email already sent at:", order.tracking_email_sent_at)
      return { success: false, error: "Tracking email was already sent for this order" }
    }

    // Update order status to shipped
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        supplier_status: "in_transit",
        status: "processing",
        shipped_at: new Date().toISOString(),
        tracking_url: trackingInfo.trackingUrl,
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Error updating order status:", updateError)
      return { success: false, error: "Failed to update order status" }
    }

    // Send shipping notification email
    console.log("[v0] Sending shipping notification to:", order.customer_email)
    const emailSent = await sendShippingNotificationEmail({
      order,
      orderItems: order.order_items,
      trackingInfo,
    })

    if (!emailSent) {
      console.error("[v0] Failed to send shipping notification email")
      return { success: false, error: "Order marked as shipped but failed to send email" }
    }

    // Mark email as sent
    const { error: emailTrackingError } = await supabase
      .from("orders")
      .update({
        tracking_email_sent_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (emailTrackingError) {
      console.error("[v0] Error tracking email sent:", emailTrackingError)
    }

    console.log("[v0] Order marked as shipped and email sent successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in markOrderAsShippedAction:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
