import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRole } from "@/lib/supabase/service-role"
import { uploadToCloudflare } from "@/lib/cloudflare/cloudflare-images"

// Factory Media images always go through this server route (matches the existing
// CF admin pattern) so the Cloudflare API token stays server-only. Factory media
// videos are uploaded client-side directly to Supabase Storage (same as ProductVideos)
// and their DB rows are inserted from the client, so there is no POST handler for video here.

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
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

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const altText = formData.get("alt_text") as string | null

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (typeof supabaseServiceRole.from !== "function") {
      throw new Error("Service role Supabase client is not initialized correctly")
    }

    // Get current max sort_order for this product's factory media
    const { data: existingMedia } = await supabaseServiceRole
      .from("product_factory_media")
      .select("sort_order")
      .eq("product_id", params.productId)
      .order("sort_order", { ascending: false })
      .limit(1)

    let nextSortOrder = (existingMedia?.[0]?.sort_order ?? -1) + 1

    const uploadedMedia = []

    for (const file of files) {
      // Upload to Cloudflare
      const cfImageId = await uploadToCloudflare(file, { productId: params.productId })

      const { data: mediaData, error: insertError } = await supabaseServiceRole
        .from("product_factory_media")
        .insert({
          product_id: params.productId,
          media_type: "image",
          cf_image_id: cfImageId,
          sort_order: nextSortOrder++,
          alt_text: altText,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[Factory Media] Database insert error:", insertError)
        throw insertError
      }

      uploadedMedia.push(mediaData)
    }

    return NextResponse.json({ media: uploadedMedia })
  } catch (error) {
    console.error("[Factory Media] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
