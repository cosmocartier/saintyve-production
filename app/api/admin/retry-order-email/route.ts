// Admin API route to manually retry sending order confirmation emails
// Accessible only to admins for recovery purposes

import { NextResponse } from "next/server"
import { manuallyTriggerOrderConfirmation } from "@/lib/manual-trigger-webhook"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    await requireAdmin()

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    const result = await manuallyTriggerOrderConfirmation(orderId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Order confirmation email sent successfully",
        details: result.result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[Retry Email API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
