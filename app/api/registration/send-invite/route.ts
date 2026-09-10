import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { sendPrivateAccessInviteEmail } from "@/lib/private-access-invite-email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Check if a valid (unused, unexpired) token already exists for this email
    const { data: existing } = await adminClient
      .from("registration_tokens")
      .select("id, used, expires_at")
      .eq("email", email)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    let tokenId: string

    if (existing) {
      // Reuse valid existing token
      tokenId = existing.id
    } else {
      // Generate a new UUID token that expires in 7 days
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data: newToken, error: insertError } = await adminClient
        .from("registration_tokens")
        .insert({
          email,
          used: false,
          expires_at: expiresAt.toISOString(),
        })
        .select("id")
        .single()

      if (insertError || !newToken) {
        console.error("[send-invite] Failed to insert token:", insertError)
        return NextResponse.json({ error: "Failed to generate invitation token" }, { status: 500 })
      }

      tokenId = newToken.id
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.designerdrip.store"
    const registrationUrl = `${baseUrl}/members/registration/${tokenId}`

    const sent = await sendPrivateAccessInviteEmail({ email, registrationUrl })

    if (!sent) {
      return NextResponse.json({ error: "Failed to send invitation email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, tokenId })
  } catch (error) {
    console.error("[send-invite] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
