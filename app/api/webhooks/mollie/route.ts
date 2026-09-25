import { type NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getMollieClient } from "@/lib/mollie/client"
import { sendOrderProcessingEmail } from "@/app/api/webhooks/order-processing/email-sender"

const FAILED_STATUSES = new Set(["canceled", "expired", "failed"])

// Mollie is the sole source of truth for payment state. This webhook never trusts
// the browser/return URL — it always re-fetches the payment from Mollie's API before
// touching the order, and only ever sends the customer confirmation email once the
// payment is verified as "paid".
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const paymentId = formData.get("id")?.toString()

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 })
    }

    console.log("[Mollie] Webhook received. Payment ID:", paymentId)

    const mollie = getMollieClient()
    const payment = await mollie.payments.get(paymentId)

    console.log("[Mollie] Payment status:", payment.status)

    const orderId = payment.metadata && (payment.metadata as any).orderId
    if (!orderId) {
      console.error("[Mollie] Webhook: payment has no orderId metadata", paymentId)
      return NextResponse.json({ received: true })
    }

    console.log("[Mollie] Order ID:", orderId)

    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_method")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[Mollie] Webhook: order not found", orderId)
      return NextResponse.json({ received: true })
    }

    if (order.payment_method !== "mollie") {
      return NextResponse.json({ received: true })
    }

    const wasAlreadyPaid = ["paid", "processing", "completed"].includes(order.status)

    const updates: Record<string, unknown> = {
      payment_status: payment.status,
      mollie_payment_id: payment.id,
      updated_at: new Date().toISOString(),
    }

    // "open", "pending", and "authorized" are NOT successful payments. The order stays
    // unpaid and no customer-facing action happens for any of them.
    if (payment.status === "paid" && !wasAlreadyPaid) {
      updates.status = "completed"
      // Prefer Mollie's own paidAt timestamp (the moment Mollie confirmed the payment)
      // and only fall back to our own clock if Mollie didn't return one.
      updates.paid_at = (payment as any).paidAt ?? new Date().toISOString()
    } else if (FAILED_STATUSES.has(payment.status) && order.status === "pending") {
      updates.status = "cancelled"
      updates.cancelled_at = new Date().toISOString()
      updates.cancel_reason = `mollie_${payment.status}`
    }

    // Idempotency guard against duplicate Mollie webhook deliveries: when marking an
    // order paid, the update is conditioned on the order NOT already being "completed".
    // Supabase performs this compare-and-swap atomically, so only the webhook delivery
    // that actually flips the status gets rows back — any duplicate delivery updates
    // zero rows and therefore never re-sends the confirmation email.
    let updateQuery = supabase.from("orders").update(updates).eq("id", orderId)
    if (payment.status === "paid") {
      updateQuery = updateQuery.neq("status", "completed")
    }

    if (payment.status === "paid" && !wasAlreadyPaid) {
      console.log("[Mollie] Updating order to paid:", orderId)
    }

    const { data: updatedRows, error: updateError } = await updateQuery.select("id")

    if (updateError) {
      console.error("[Mollie] Failed to update order:", orderId, updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    if (payment.status === "paid" && !wasAlreadyPaid) {
      console.log("[Supabase] Order updated successfully:", orderId)
    }

    const orderWasJustMarkedPaid =
      payment.status === "paid" && !wasAlreadyPaid && (updatedRows?.length ?? 0) > 0

    if (orderWasJustMarkedPaid) {
      console.log("[Order] Marked as paid:", orderId)

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products:product_id ( id, name, slug, image_folder ),
          product_variants:variant_id ( id, size, color, sku )
        `,
        )
        .eq("order_id", orderId)

      if (itemsError) {
        console.error("[Order] Failed to fetch order items for confirmation email:", itemsError)
      } else {
        const { data: fullOrder } = await supabase.from("orders").select("*").eq("id", orderId).single()

        try {
          const emailSent = await sendOrderProcessingEmail({
            order: fullOrder ?? order,
            orderItems: orderItems || [],
          })
          console.log("[Email] Confirmation sent:", emailSent)

          if (emailSent) {
            // Idempotency marker: if Mollie redelivers this webhook, the compare-and-swap
            // update above already prevents a second run of this block, and this column
            // also lets other flows (e.g. /api/orders/confirm) know a confirmation went out.
            await supabase
              .from("orders")
              .update({ confirmation_email_sent_at: new Date().toISOString() })
              .eq("id", orderId)
          }
        } catch (emailError) {
          console.error("[Email] Failed to send confirmation email:", emailError)
        }
      }
    } else if (payment.status === "paid" && wasAlreadyPaid) {
      console.log("[Mollie] Payment already marked paid — skipping duplicate email for order:", orderId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Mollie] Error in webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
