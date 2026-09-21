"use server"

import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { getMollieClient, getSiteBaseUrl } from "@/lib/mollie/client"

/**
 * Creates (or reuses) a Mollie payment for an order and returns the
 * checkout URL the customer should be redirected to.
 */
export async function createMolliePayment(orderId: string) {
  try {
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_method, total_amount, mollie_payment_id, customer_email")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: "Order not found" }
    }

    if (order.payment_method !== "mollie") {
      return { success: false, error: "Invalid payment method for this flow" }
    }

    if (order.status !== "pending") {
      return { success: false, error: "Order is not awaiting payment" }
    }

    const mollie = getMollieClient()
    const baseUrl = getSiteBaseUrl()

    // Reuse an existing payment if it's still open/pending
    if (order.mollie_payment_id) {
      try {
        const existingPayment = await mollie.payments.get(order.mollie_payment_id)

        // The customer landed back here before the webhook processed the
        // completed payment (race condition) — settle the order now instead
        // of creating a second payment for the same order.
        if (existingPayment.status === "paid") {
          await supabase
            .from("orders")
            .update({
              status: "completed",
              payment_status: "paid",
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)

          return { success: false, alreadyPaid: true, error: "Order already paid" }
        }

        const checkoutUrl = existingPayment._links?.checkout?.href

        if (checkoutUrl && ["open", "pending"].includes(existingPayment.status)) {
          return { success: true, checkoutUrl }
        }
      } catch (error) {
        console.error("[v0] Failed to retrieve existing Mollie payment:", error)
      }
    }

    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: Number(order.total_amount).toFixed(2),
      },
      description: `Saint Yve order #${order.id.slice(0, 8).toUpperCase()}`,
      redirectUrl: `${baseUrl}/order-confirmation/${order.id}`,
      webhookUrl: `${baseUrl}/api/webhooks/mollie`,
      metadata: {
        orderId: order.id,
      },
    })

    const checkoutUrl = payment._links?.checkout?.href

    if (!checkoutUrl) {
      console.error("[v0] Mollie payment created without checkout link:", payment.id)
      return { success: false, error: "Failed to start payment" }
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        mollie_payment_id: payment.id,
        payment_status: payment.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Failed to save Mollie payment id:", updateError)
    }

    return { success: true, checkoutUrl }
  } catch (error) {
    console.error("[v0] Error creating Mollie payment:", error)
    return { success: false, error: "Failed to start payment" }
  }
}

export async function uploadPaymentProof(formData: FormData) {
  const file = formData.get("file") as File
  const orderId = formData.get("orderId") as string
  const senderHint = formData.get("senderHint") as string | null

  if (!file || !orderId) {
    return { success: false, error: "Missing required fields" }
  }

  try {
    const supabase = await createClient()

    // Check order exists and is awaiting transfer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_method, customer_email")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: "Order not found" }
    }

    if (order.status !== "pending" && order.status !== "processing") {
      return { success: false, error: "Order is not awaiting payment" }
    }

    if (order.payment_method !== "bank_transfer") {
      return { success: false, error: "Invalid payment method for this flow" }
    }

    // Upload file to Vercel Blob
    const timestamp = Date.now()
    const filename = `payment-proofs/${orderId}/${timestamp}-${file.name}`

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        payment_proof_url: blob.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Failed to update order status:", updateError)
      return { success: false, error: "Failed to update order status" }
    }

    console.log("[v0] Payment proof uploaded successfully:", { orderId, fileUrl: blob.url })

    return {
      success: true,
      message: "Payment proof submitted successfully. We will verify your transfer shortly.",
    }
  } catch (error) {
    console.error("[v0] Error uploading payment proof:", error)
    return { success: false, error: "Failed to upload payment proof" }
  }
}

export async function expireOrder(orderId: string) {
  try {
    const supabase = await createClient()

    // Re-fetch order to check current state
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, reserved_until, payment_method")
      .eq("id", orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: "Order not found" }
    }

    // Don't cancel if already paid or cancelled
    if (order.status === "processing" || order.status === "completed" || order.status === "cancelled") {
      return { success: false, error: "Order already processed", status: order.status }
    }

    // Only cancel if reservation has actually expired
    const now = new Date()
    const reservedUntil = order.reserved_until ? new Date(order.reserved_until) : null

    if (reservedUntil && now >= reservedUntil && (order.status === "pending" || order.status === "processing")) {
      // Cancel the order
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: now.toISOString(),
          cancel_reason: "reservation_expired",
          updated_at: now.toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("[v0] Failed to expire order:", updateError)
        return { success: false, error: "Failed to cancel order" }
      }

      console.log("[v0] Order expired and cancelled:", orderId)
      return { success: true, status: "cancelled" }
    }

    return { success: false, error: "Order not expired yet", status: order.status }
  } catch (error) {
    console.error("[v0] Error expiring order:", error)
    return { success: false, error: "Failed to process expiry" }
  }
}

export async function markPaymentComplete(orderId: string) {
  try {
    const supabase = await createClient()

    // Check order exists and is awaiting payment
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_method, customer_email")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: "Order not found" }
    }

    if (order.status !== "pending") {
      return { success: false, error: "Order is not awaiting payment" }
    }

    // Update order status to processing (awaiting verification)
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Failed to update order status:", updateError)
      return { success: false, error: "Failed to update order status" }
    }

    console.log("[v0] Order marked as paid:", orderId)

    return {
      success: true,
      message: "Payment confirmed. We're verifying your payment.",
    }
  } catch (error) {
    console.error("[v0] Error marking payment as complete:", error)
    return { success: false, error: "Failed to confirm payment" }
  }
}
