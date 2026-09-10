import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRole } from "@/lib/supabase/service-role"

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const supabase = await createClient()

    // Check admin auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { mediaIds } = await request.json()

    if (!Array.isArray(mediaIds)) {
      return NextResponse.json({ error: "Invalid mediaIds" }, { status: 400 })
    }

    // To avoid unique constraint violations on (product_id, sort_order),
    // we use a two-step process:
    // 1. Set all media to temporary negative values (which won't conflict)
    // 2. Update them to their final correct values

    // Step 1: Set to temporary negative values
    const tempUpdates = mediaIds.map((id, index) =>
      supabaseServiceRole
        .from("product_factory_media")
        .update({ sort_order: -(index + 1) }) // Use negative values as temp
        .eq("id", id)
        .eq("product_id", params.productId),
    )

    await Promise.all(tempUpdates)

    // Step 2: Update to final correct values
    const finalUpdates = mediaIds.map((id, index) =>
      supabaseServiceRole
        .from("product_factory_media")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("product_id", params.productId),
    )

    await Promise.all(finalUpdates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Factory Media] Reorder error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reorder failed" }, { status: 500 })
  }
}
