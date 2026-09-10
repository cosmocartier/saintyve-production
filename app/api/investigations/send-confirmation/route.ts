import { type NextRequest, NextResponse } from "next/server"
import { sendAlternativeConfirmedEmail } from "@/lib/investigation-emails"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerEmail, customerName, orderNumber, replacementItem } = body

    if (!customerEmail || !customerName || !orderNumber || !replacementItem) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await sendAlternativeConfirmedEmail({
      customerEmail,
      customerName,
      orderNumber,
      replacementItem,
    })

    if (!success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in send-confirmation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
