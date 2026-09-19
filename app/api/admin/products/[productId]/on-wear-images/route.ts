import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseServiceRole } from "@/lib/supabase/service-role"
import { uploadToCloudflare } from "@/lib/cloudflare/cloudflare-images"

const MAX_ON_WEAR_IMAGES = 6

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

    // Enforce the 6-image cap across the aggregate (existing + incoming)
    const { count: existingCount } = await supabaseServiceRole
      .from("product_images_cf")
      .select("id", { count: "exact", head: true })
      .eq("product_id", params.productId)
      .eq("on_wear", true)

    const currentCount = existingCount ?? 0
    if (currentCount + files.length > MAX_ON_WEAR_IMAGES) {
      return NextResponse.json(
        {
          error: `On-wear images are limited to ${MAX_ON_WEAR_IMAGES}. You currently have ${currentCount} and tried to add ${files.length}.`,
        },
        { status: 400 },
      )
    }

    // Get current max sort_order among this product's on-wear images
    const { data: existingImages } = await supabaseServiceRole
      .from("product_images_cf")
      .select("sort_order")
      .eq("product_id", params.productId)
      .eq("on_wear", true)
      .order("sort_order", { ascending: false })
      .limit(1)

    let nextSortOrder = (existingImages?.[0]?.sort_order ?? -1) + 1

    const uploadedImages = []

    for (const file of files) {
      // Upload to Cloudflare
      const cfImageId = await uploadToCloudflare(file, { productId: params.productId })

      const { data: imageData, error: insertError } = await supabaseServiceRole
        .from("product_images_cf")
        .insert({
          product_id: params.productId,
          cf_image_id: cfImageId,
          role: "onwear",
          on_wear: true,
          sort_order: nextSortOrder++,
          alt_text: altText,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[On-Wear Images] Database insert error:", insertError)
        throw insertError
      }

      uploadedImages.push(imageData)
    }

    return NextResponse.json({ images: uploadedImages })
  } catch (error) {
    console.error("[On-Wear Images] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
