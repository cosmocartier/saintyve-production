import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { status, card_front_url, card_back_url } = body

    // Guard: Both images must be present to change status
    if (!card_front_url || !card_back_url) {
      return NextResponse.json({ error: "Both card images are required to update membership status" }, { status: 400 })
    }

    const { data: currentMembership } = await supabase
      .from("memberships")
      .select("status, user_id, profiles!inner(email, first_name)")
      .eq("id", params.id)
      .single()

    console.log("[v0] Current membership data:", JSON.stringify(currentMembership, null, 2))

    // Update membership
    const { data, error } = await supabase
      .from("memberships")
      .update({
        status,
        card_front_url,
        card_back_url,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating membership:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (currentMembership && status === "platinum" && currentMembership.status !== "platinum") {
      const profileData = currentMembership.profiles

      console.log("[v0] Profile data for email:", JSON.stringify(profileData, null, 2))

      if (!profileData || !profileData.email) {
        console.error("[v0] Missing profile data or email")
        return NextResponse.json({ success: true, data, emailSent: false })
      }

      console.log("[v0] Status changed to platinum, sending activation email...")

      try {
        const emailPayload = {
          customerEmail: profileData.email,
          customerName: profileData.first_name || profileData.email,
          cardFrontUrl: card_front_url,
          cardBackUrl: card_back_url,
        }

        console.log("[v0] Email payload:", JSON.stringify(emailPayload, null, 2))

        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://designerdrip.store"}/api/membership/activate-platinum`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload),
          },
        )

        const emailResult = await emailResponse.json()
        console.log("[v0] Email API response:", JSON.stringify(emailResult, null, 2))

        if (!emailResponse.ok) {
          console.error("[v0] Failed to send Platinum activation email:", emailResult)
        } else {
          console.log("[v0] Platinum activation email sent successfully")
        }
      } catch (emailError) {
        console.error("[v0] Error sending Platinum activation email:", emailError)
        // Don't block the status update if email fails
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/admin/memberships/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
