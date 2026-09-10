import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const collection = searchParams.get("collection")
  const brand = searchParams.get("brand")
  const parentProduct = searchParams.get("parentProduct")
  const limit = Number(searchParams.get("limit") ?? "4")

  if (!collection && !brand && !parentProduct) {
    return NextResponse.json({ error: "Missing collection or brand" }, { status: 400 })
  }

  const supabase = await createClient()

  let productsData: any[] = []

  if (parentProduct) {
    // Parent product name mode: query products by parent_product_name field
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (
          id,
          size,
          stock_quantity
        ),
        product_images (
          id,
          url,
          alt_text,
          display_order,
          color_name,
          color_hex
        )
      `)
      .eq("parent_product_name", parentProduct)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      return NextResponse.json({ products: [] })
    }

    productsData = data
  } else if (brand) {
    // Brand mode: query products directly by brand field
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (
          id,
          size,
          stock_quantity
        ),
        product_images (
          id,
          url,
          alt_text,
          display_order,
          color_name,
          color_hex
        )
      `)
      .eq("brand", brand)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      return NextResponse.json({ products: [] })
    }

    productsData = data
  } else {
    // Collection mode: resolve slug → category_id → product_categories join
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", collection)
      .single()

    if (!categoryRow) {
      return NextResponse.json({ products: [] })
    }

    const { data: productCategories, error } = await supabase
      .from("product_categories")
      .select(
        `
        product_id,
        sort_order,
        products!inner (
          *,
          product_variants (
            id,
            size,
            stock_quantity
          ),
          product_images (
            id,
            url,
            alt_text,
            display_order,
            color_name,
            color_hex
          )
        )
      `
      )
      .eq("category_id", categoryRow.id)
      .eq("products.status", "live")
      .order("products(created_at)", { ascending: false })
      .limit(limit)

    if (error || !productCategories) {
      return NextResponse.json({ products: [] })
    }

    productsData = productCategories.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    }))
  }

  // 4. Cloudflare Images enrichment
  const cfProductIds = productsData
    .filter((p: any) => p.use_cloudflare_images)
    .map((p: any) => p.id)

  const cfImagesMap = new Map<string, any[]>()

  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("*")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })

    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) {
          cfImagesMap.set(img.product_id, [])
        }
        cfImagesMap.get(img.product_id)!.push({
          id: img.id,
          url: buildCfUrl(img.cf_image_id, "grid"),
          alt_text: img.alt_text,
          display_order: img.sort_order,
          color_name: img.color_name,
          color_hex: img.color_hex,
        })
      })
    }
  }

  // 5. Replace images with CF versions where applicable
  const optimizedProducts = productsData.map((product: any) => ({
    ...product,
    product_images: product.use_cloudflare_images
      ? cfImagesMap.get(product.id) || []
      : product.product_images?.sort(
          (a: any, b: any) => a.display_order - b.display_order
        ) || [],
  }))

  return NextResponse.json({ products: optimizedProducts })
}
