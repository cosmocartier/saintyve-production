import { createClient } from "@/lib/supabase/server"
import { sendItemUnavailableEmail } from "@/lib/investigation-emails"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const { caseId } = await request.json()

    const supabase = await createClient()

    // Fetch case with order details
    const { data: caseData, error: caseError } = await supabase
      .from("investigation_cases")
      .select(
        `
        *,
        orders (
          id,
          customer_name,
          customer_email,
          profiles (
            full_name,
            email
          )
        )
      `,
      )
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return Response.json({ error: "Case not found" }, { status: 404 })
    }

    // Parse unavailable items from description
    const match = caseData.description?.match(/Unavailable Items:\n([\s\S]+)$/)
    let unavailableItems = []
    if (match) {
      try {
        unavailableItems = JSON.parse(match[1])
      } catch (e) {
        console.error("Error parsing unavailable items:", e)
      }
    }

    // Generate secure token
    const secureToken = randomBytes(32).toString("hex")

    // Store token and metadata in description field
    const metadata = {
      token: secureToken,
      tokenCreatedAt: new Date().toISOString(),
      emailSent: true,
      customerResponseReceived: false,
    }

    const updatedDescription = `${caseData.description}\n\n---\nMetadata: ${JSON.stringify(metadata)}`

    // Update case with token
    await supabase
      .from("investigation_cases")
      .update({
        description: updatedDescription,
      })
      .eq("id", caseId)

    // Send email
    const customerEmail = caseData.orders.profiles?.email || caseData.orders.customer_email
    const customerName = caseData.orders.profiles?.full_name || caseData.orders.customer_name || "Customer"
    const orderNumber = caseData.orders.id.slice(0, 8).toUpperCase()

    const emailSent = await sendItemUnavailableEmail({
      customerEmail,
      customerName,
      orderNumber,
      unavailableItems,
      caseId,
      secureToken,
    })

    if (!emailSent) {
      return Response.json({ error: "Failed to send email" }, { status: 500 })
    }

    return Response.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending investigation notification:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
