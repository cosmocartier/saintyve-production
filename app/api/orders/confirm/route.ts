import { type NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { sendOrderConfirmationEmail } from "../../webhooks/order-confirmation/email-sender"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      console.error("[v0] Failed to fetch order:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Safety guard: this endpoint must only ever notify the customer once the order
    // has actually been paid. Mollie is the payment authority — an order sitting at
    // "pending"/"open" (Mollie payment not yet confirmed) must never trigger a
    // customer-facing confirmation, no matter what triggered this request.
    const isPaidOrBeyond = ["completed", "paid", "processing", "shipped", "delivered"].includes(order.status)
    if (!isPaidOrBeyond) {
      console.log("[v0] Order confirm skipped — order is not paid yet:", order.id, order.status)
      return NextResponse.json({ success: true, skipped: true, reason: "Order not paid yet" })
    }

    if (order.confirmation_email_sent_at) {
      console.log("[v0] Order confirm skipped — confirmation already sent:", order.id)
      return NextResponse.json({ success: true, skipped: true, reason: "Confirmation already sent" })
    }

    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        id,
        quantity,
        price,
        products:product_id (
          name,
          slug
        ),
        product_variants:variant_id (
          size,
          color
        )
      `,
      )
      .eq("order_id", order.id)

    if (itemsError) {
      console.error("[v0] Error fetching order items:", itemsError)
      return NextResponse.json({ error: "Failed to fetch order items" }, { status: 500 })
    }

    console.log("[v0] Fetched order items:", orderItems?.length || 0)

    const emailSent = await sendOrderConfirmationEmail({
      order,
      orderItems: orderItems || [],
    })

    if (!emailSent) {
      console.error("[v0] Failed to send confirmation email")
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
    }

    // Mark confirmation as sent so duplicate/retried calls never re-send the email.
    await supabase.from("orders").update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", order.id)

    console.log("[v0] Order confirmation email sent successfully")

    return NextResponse.json({ success: true, message: "Order confirmation sent" })
  } catch (error) {
    console.error("[v0] Error in order confirmation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
