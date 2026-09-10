// Manual webhook trigger utility for testing or recovery
// This can be called from an API route or admin panel to manually send confirmation emails

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function manuallyTriggerOrderConfirmation(orderId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("[Manual Trigger] Sending confirmation for order:", orderId)

  try {
    // Fetch the order
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`)
    }

    // Fetch order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products!order_items_product_id_fkey (id, name, slug, image_folder),
        product_variants!order_items_variant_id_fkey (id, size, color, sku)
      `,
      )
      .eq("order_id", orderId)

    if (itemsError || !orderItems || orderItems.length === 0) {
      throw new Error(`Order items not found: ${itemsError?.message}`)
    }

    // Call the webhook endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/webhooks/order-confirmation`
    const webhookSecret = process.env.WEBHOOK_SECRET

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": webhookSecret || "",
      },
      body: JSON.stringify({
        type: "INSERT",
        table: "orders",
        record: order,
        old_record: null,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Webhook failed: ${JSON.stringify(result)}`)
    }

    console.log("[Manual Trigger] Success:", result)
    return { success: true, result }
  } catch (error) {
    console.error("[Manual Trigger] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
