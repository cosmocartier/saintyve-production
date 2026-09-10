import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get("ids")

  if (!idsParam) {
    return NextResponse.json({ products: [] })
  }

  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean)
  if (ids.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const supabase = await createClient()

  // Fetch base product data + legacy images
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      use_cloudflare_images,
      product_images (
        id,
        url,
        alt_text,
        display_order
      )
    `)
    .in("id", ids)
    .eq("status", "live")

  if (error || !products) {
    return NextResponse.json({ products: [] })
  }

  // Fetch CF images for products that use Cloudflare
  const cfProductIds = products
    .filter((p: any) => p.use_cloudflare_images)
    .map((p: any) => p.id)

  const cfImagesMap = new Map<string, any[]>()
  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("id, product_id, cf_image_id, alt_text, sort_order, color_name, color_hex")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })

    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) {
          cfImagesMap.set(img.product_id, [])
        }
        cfImagesMap.get(img.product_id)!.push(img)
      })
    }
  }

  // Merge CF images into products as cf_images field
  const enriched = products.map((p: any) => ({
    ...p,
    cf_images: p.use_cloudflare_images ? (cfImagesMap.get(p.id) ?? []) : [],
  }))

  return NextResponse.json({ products: enriched })
}
