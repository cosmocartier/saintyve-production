"use server"

import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"

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
