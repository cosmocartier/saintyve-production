import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRole } from "@/lib/supabase/service-role"
import { deleteFromCloudflare } from "@/lib/cloudflare/cloudflare-images"

export async function PATCH(request: NextRequest, { params }: { params: { productId: string; mediaId: string } }) {
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
      .from("product_factory_media")
      .update(updateData)
      .eq("id", params.mediaId)
      .eq("product_id", params.productId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ media: data })
  } catch (error) {
    console.error("[Factory Media] Update error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string; mediaId: string } }) {
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

    // Get media data before deleting
    const { data: mediaData } = await supabaseServiceRole
      .from("product_factory_media")
      .select("media_type, cf_image_id, video_url")
      .eq("id", params.mediaId)
      .single()

    // Delete from database
    const { error: dbError } = await supabaseServiceRole
      .from("product_factory_media")
      .delete()
      .eq("id", params.mediaId)
      .eq("product_id", params.productId)

    if (dbError) throw dbError

    // Delete underlying file (fire and forget - don't block on this)
    if (mediaData?.media_type === "image" && mediaData.cf_image_id) {
      deleteFromCloudflare(mediaData.cf_image_id).catch((err) => {
        console.error("[Factory Media] Cloudflare delete error:", err)
      })
    } else if (mediaData?.media_type === "video" && mediaData.video_url) {
      const urlParts = mediaData.video_url.split("/products/factory-media/")
      if (urlParts.length === 2) {
        const filePath = `products/factory-media/${urlParts[1]}`
        supabaseServiceRole.storage
          .from("product-images")
          .remove([filePath])
          .then(({ error: storageError }) => {
            if (storageError) {
              console.error("[Factory Media] Storage delete error:", storageError)
            }
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Factory Media] Delete error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 })
  }
}
