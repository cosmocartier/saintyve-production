import { type NextRequest, NextResponse } from "next/server"
import { sendPlatinumActivationEmail } from "@/lib/platinum-activation-email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerEmail, customerName, cardFrontUrl, cardBackUrl } = body

    console.log("[v0] Activate platinum endpoint called with:", JSON.stringify(body, null, 2))

    if (!customerEmail || !customerName) {
      console.error("[v0] Missing required fields:", { customerEmail, customerName })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await sendPlatinumActivationEmail({
      customerEmail,
      customerName,
      cardFrontUrl,
      cardBackUrl,
    })

    if (!success) {
      console.error("[v0] sendPlatinumActivationEmail returned false")
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.log("[v0] Email sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in activate-platinum route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
