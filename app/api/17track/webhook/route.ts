import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Environment variables
const WEBHOOK_SECRET = process.env.SEVENTEENTRACK_WEBHOOK_SECRET!
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const maxDuration = 60
export const dynamic = "force-dynamic"

/**
 * Helper function to compute SHA256 hash
 */
function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex")
}

/**
 * Extract raw JSON string for the data field from raw request body
 * This is critical to avoid whitespace/order issues when verifying signature
 */
function extractRawDataJsonFromBody(rawBody: string): string | null {
  try {
    // Find the "data": part
    const dataMatch = rawBody.match(/"data"\s*:\s*(\{.*?\}(?=\s*,\s*"sign"|$))/s)
    if (dataMatch && dataMatch[1]) {
      return dataMatch[1]
    }
    return null
  } catch (error) {
    console.error("[v0] Error extracting raw data JSON:", error)
    return null
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "17TRACK webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("[v0] ===== 17TRACK WEBHOOK TRIGGERED =====")
  console.log("[v0] Timestamp:", new Date().toISOString())

  try {
    // Get raw body text for signature verification
    const rawBody = await request.text()
    console.log("[v0] Raw request body received")

    // Parse JSON payload
    let payload: {
      event?: string
      data?: {
        tag?: string
        track?: {
          e?: number // statusCode
        }
      }
      sign?: string
    }

    try {
      payload = JSON.parse(rawBody)
      console.log("[v0] Parsed payload:", {
        event: payload.event,
        tag: payload.data?.tag,
        statusCode: payload.data?.track?.e,
      })
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Verify signature
    const { event, data, sign } = payload

    if (!event || !data || !sign) {
      console.error("[v0] Missing required fields: event, data, or sign")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Extract raw data JSON string from body
    const rawDataJson = extractRawDataJsonFromBody(rawBody)
    if (!rawDataJson) {
      console.error("[v0] Could not extract raw data JSON from body")
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    // Compute expected signature: sha256("${event}/${RAW_DATA_JSON}/${SECRET}")
    const expectedSign = sha256(`${event}/${rawDataJson}/${WEBHOOK_SECRET}`)

    console.log("[v0] Signature verification:", {
      received: sign,
      expected: expectedSign,
      match: sign === expectedSign,
    })

    if (sign !== expectedSign) {
      console.error("[v0] Invalid signature - authentication failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Signature verified successfully")

    // Only process TRACKING_UPDATED events
    if (event !== "TRACKING_UPDATED") {
      console.log("[v0] Skipping non-TRACKING_UPDATED event:", event)
      return NextResponse.json({ ok: true, message: "Event type not processed" })
    }

    // Extract tracking data
    const tag = data.tag // This is our orderId mapping
    const statusCode = data.track?.e

    console.log("[v0] Processing tracking update:", { tag, statusCode })

    if (!tag) {
      console.log("[v0] No tag (orderId) found in data")
      return NextResponse.json({ ok: true, message: "No tag found" })
    }

    // Check if status is "Delivered" (statusCode === 40)
    if (statusCode === 40) {
      console.log("[v0] Status is delivered (40), updating order:", tag)

      // Check if order exists and is not already delivered
      const { data: existingOrder, error: fetchError } = await supabase
        .from("orders")
        .select("id, supplier_status, delivered_at")
        .eq("id", tag)
        .single()

      if (fetchError) {
        console.error("[v0] Error fetching order:", fetchError)
        // Return 200 anyway so 17TRACK doesn't retry
        return NextResponse.json({
          ok: true,
          message: "Order not found, but acknowledged",
        })
      }

      // Idempotent check: skip if already delivered
      if (existingOrder.supplier_status === "delivered" && existingOrder.delivered_at) {
        console.log("[v0] Order already marked as delivered, skipping update")
        return NextResponse.json({
          ok: true,
          message: "Order already delivered",
        })
      }

      // Update order to delivered
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          supplier_status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", tag)

      if (updateError) {
        console.error("[v0] Error updating order:", updateError)
        // Still return 200 to prevent retries
        return NextResponse.json({
          ok: true,
          message: "Error updating order, but acknowledged",
        })
      }

      console.log("[v0] Order successfully updated to delivered:", tag)
      return NextResponse.json({
        ok: true,
        message: "Order updated to delivered",
        orderId: tag,
      })
    } else {
      console.log("[v0] Status code is not delivered (40):", statusCode)
      return NextResponse.json({
        ok: true,
        message: "Status not delivered",
      })
    }
  } catch (error) {
    console.error("[v0] ===== WEBHOOK ERROR =====")
    console.error("[v0] Error:", error)
    console.error("[v0] Stack:", error instanceof Error ? error.stack : "No stack trace")

    // Return 200 even on error to prevent 17TRACK from retrying
    return NextResponse.json({
      ok: true,
      message: "Error processed, acknowledged",
    })
  }
}
