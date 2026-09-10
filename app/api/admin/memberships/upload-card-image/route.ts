import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const membershipId = formData.get("membershipId") as string
    const side = formData.get("side") as string

    if (!file || !membershipId || !side) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const blob = await put(
      `membership-cards/${membershipId}-${side}-${Date.now()}.${file.name.split(".").pop()}`,
      file,
      {
        access: "public",
      },
    )

    console.log(`[v0] Uploaded ${side} card image for membership ${membershipId}:`, blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Error uploading card image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
