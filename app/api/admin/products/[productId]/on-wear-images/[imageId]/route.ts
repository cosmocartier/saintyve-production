import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRole } from "@/lib/supabase/service-role"
import { deleteFromCloudflare } from "@/lib/cloudflare/cloudflare-images"

export async function PATCH(request: NextRequest, { params }: { params: { productId: string; imageId: string } }) {
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

    const body = await request.json()
    const { alt_text, sort_order } = body

    const updateData: { alt_text?: string | null; sort_order?: number } = {}
    if (alt_text !== undefined) updateData.alt_text = alt_text
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data, error } = await supabaseServiceRole
      .from("product_images_cf")
      .update(updateData)
      .eq("id", params.imageId)
      .eq("product_id", params.productId)
      .eq("on_wear", true)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ image: data })
  } catch (error) {
    console.error("[On-Wear Images] Update error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string; imageId: string } }) {
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

    // Get image data before deleting
    const { data: imageData } = await supabaseServiceRole
      .from("product_images_cf")
      .select("cf_image_id")
      .eq("id", params.imageId)
      .eq("on_wear", true)
      .single()

    // Delete from database
    const { error: dbError } = await supabaseServiceRole
      .from("product_images_cf")
      .delete()
      .eq("id", params.imageId)
      .eq("product_id", params.productId)
      .eq("on_wear", true)

    if (dbError) throw dbError

    // Delete from Cloudflare (fire and forget - don't block on this)
    if (imageData?.cf_image_id) {
      deleteFromCloudflare(imageData.cf_image_id).catch((err) => {
        console.error("[On-Wear Images] Cloudflare delete error:", err)
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[On-Wear Images] Delete error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 })
  }
}
