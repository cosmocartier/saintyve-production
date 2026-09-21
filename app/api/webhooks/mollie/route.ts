import { type NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getMollieClient } from "@/lib/mollie/client"

const FAILED_STATUSES = new Set(["canceled", "expired", "failed"])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const paymentId = formData.get("id")?.toString()

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 })
    }

    const mollie = getMollieClient()
    const payment = await mollie.payments.get(paymentId)

    const orderId = payment.metadata && (payment.metadata as any).orderId
    if (!orderId) {
      console.error("[v0] Mollie webhook: payment has no orderId metadata", paymentId)
      return NextResponse.json({ received: true })
    }

    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_method")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[v0] Mollie webhook: order not found", orderId)
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

    if (payment.status === "paid" && !wasAlreadyPaid) {
      updates.status = "completed"
      updates.paid_at = new Date().toISOString()
    } else if (FAILED_STATUSES.has(payment.status) && order.status === "pending") {
      updates.status = "cancelled"
      updates.cancelled_at = new Date().toISOString()
      updates.cancel_reason = `mollie_${payment.status}`
    }

    const { error: updateError } = await supabase.from("orders").update(updates).eq("id", orderId)

    if (updateError) {
      console.error("[v0] Mollie webhook: failed to update order", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    if (payment.status === "paid" && !wasAlreadyPaid) {
      fetch(`${request.nextUrl.origin}/api/orders/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).catch((error) => {
        console.error("[v0] Mollie webhook: failed to trigger confirmation email", error)
      })
    }

    console.log("[v0] Mollie webhook processed:", { orderId, paymentStatus: payment.status })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error in Mollie webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
