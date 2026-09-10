import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { Review, ReviewMediaItem } from "@/lib/types/review"

const PAGE_SIZE = 12

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "recent"
  const offset = Number(searchParams.get("offset") ?? "0")
  const limit = Math.min(Number(searchParams.get("limit") ?? String(PAGE_SIZE)), 24)

  try {
    const supabase = await createClient()

    const {
      data: reviewRows,
      error,
      count,
    } = await supabase
      .from("reviews")
      .select("id, customer_name, review_date, title, review, country, rating, product_id, media, created_at", {
        count: "exact",
      })
      .eq("published", true)
      .order("review_date", { ascending: sort === "oldest" })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Failed to fetch reviews:", error.message)
      return NextResponse.json({ error: "Reviews are temporarily unavailable." }, { status: 500 })
    }

    const rows = reviewRows ?? []
    const productIds = Array.from(new Set(rows.map((r) => r.product_id).filter((id): id is string => Boolean(id))))

    const productMap = new Map<
      string,
      { id: string; name: string; slug: string; use_cloudflare_images: boolean | null }
    >()

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, use_cloudflare_images")
        .in("id", productIds)

      products?.forEach((p) => productMap.set(p.id, p))
    }

    const imageMap = new Map<string, string>()

    const cfProductIds = productIds.filter((id) => productMap.get(id)?.use_cloudflare_images)
    const legacyProductIds = productIds.filter((id) => !productMap.get(id)?.use_cloudflare_images)

    if (cfProductIds.length > 0) {
      const { data: cfImages } = await supabase
        .from("product_images_cf")
        .select("product_id, cf_image_id, sort_order")
        .in("product_id", cfProductIds)
        .order("sort_order", { ascending: true })

      cfImages?.forEach((img) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, buildCfUrl(img.cf_image_id, "grid"))
        }
      })
    }

    if (legacyProductIds.length > 0) {
      const { data: legacyImages } = await supabase
        .from("product_images")
        .select("product_id, url, display_order")
        .in("product_id", legacyProductIds)
        .order("display_order", { ascending: true })

      legacyImages?.forEach((img) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.url)
        }
      })
    }

    const reviews: Review[] = rows.map((row) => {
      const product = row.product_id ? productMap.get(row.product_id) : null
      const media = ((row as { media?: ReviewMediaItem[] | null }).media ?? []) as ReviewMediaItem[]
      return {
        id: row.id,
        customer_name: row.customer_name,
        review_date: row.review_date,
        title: row.title ?? null,
        review: row.review,
        country: row.country,
        rating: row.rating,
        created_at: row.created_at,
        media: media.slice().sort((a, b) => a.sort_order - b.sort_order),
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: imageMap.get(product.id) ?? null,
            }
          : null,
      }
    })

    const total = count ?? reviews.length

    return NextResponse.json({
      reviews,
      total,
      hasMore: offset + reviews.length < total,
    })
  } catch (err) {
    console.error("[v0] Unexpected error fetching reviews:", err)
    return NextResponse.json({ error: "Reviews are temporarily unavailable." }, { status: 500 })
  }
}
