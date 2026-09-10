import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderProcessingEmail } from "./email-sender"

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret-key"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Order processing webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  console.log("[v0] ===== ORDER PROCESSING WEBHOOK TRIGGERED =====")

  try {
    const bodyText = await request.text()
    console.log("[v0] Raw request body:", bodyText)

    let payload
    try {
      payload = JSON.parse(bodyText)
    } catch (parseError) {
      console.error("[v0] Failed to parse JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    console.log("[v0] Parsed webhook payload:", {
      type: payload.type,
      table: payload.table,
      old_status: payload.old_record?.status,
      new_status: payload.record?.status,
    })

    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature")
    if (signature !== WEBHOOK_SECRET) {
      console.error("[v0] Invalid webhook signature")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only process UPDATE events for orders where status changed to "processing"
    if (
      payload.type !== "UPDATE" ||
      payload.table !== "orders" ||
      payload.old_record?.status !== "pending" ||
      payload.record?.status !== "processing"
    ) {
      console.log("[v0] Skipping event - Not a pending->processing status change")
      return NextResponse.json({ success: true, message: "Event ignored" })
    }

    const order = payload.record
    console.log("[v0] Processing order status change for order:", order.id)

    // Create Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
      throw new Error(`Failed to fetch order items: ${itemsError.message}`)
    }

    console.log("[v0] Fetched order items:", orderItems?.length || 0)

    // Send processing email
    const emailSent = await sendOrderProcessingEmail({ order, orderItems: orderItems || [] })

    if (!emailSent) {
      console.error("[v0] Failed to send processing email")
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
    }

    console.log("[v0] Processing email sent successfully")

    return NextResponse.json({
      success: true,
      message: "Order processing webhook processed",
      order_id: order.id,
    })
  } catch (error) {
    console.error("[v0] ===== WEBHOOK ERROR =====")
    console.error("[v0] Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
