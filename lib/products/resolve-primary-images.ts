import type { SupabaseClient } from "@supabase/supabase-js"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

/**
 * Resolves a primary display image for a batch of products, honoring the
 * same Cloudflare-vs-legacy convention used across /admin/products.
 * Avoids N+1 queries by batching both image sources.
 */
export async function resolvePrimaryImages(
  supabase: SupabaseClient,
  products: Array<{ id: string; use_cloudflare_images?: boolean | null }>,
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()

  const cfProductIds = products.filter((p) => p.use_cloudflare_images).map((p) => p.id)
  const legacyProductIds = products.filter((p) => !p.use_cloudflare_images).map((p) => p.id)

  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("product_id, cf_image_id, role, sort_order")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })

    const grouped = new Map<string, { cf_image_id: string; role: string; sort_order: number }[]>()
    cfImages?.forEach((img: any) => {
      if (!grouped.has(img.product_id)) grouped.set(img.product_id, [])
      grouped.get(img.product_id)!.push(img)
    })

    grouped.forEach((imgs, productId) => {
      const primary = imgs.find((img) => img.role === "primary") ?? imgs[0]
      if (primary) imageMap.set(productId, buildCfUrl(primary.cf_image_id, "grid"))
    })
  }

  if (legacyProductIds.length > 0) {
    const { data: legacyImages } = await supabase
      .from("product_images")
      .select("product_id, url, display_order")
      .in("product_id", legacyProductIds)
      .order("display_order", { ascending: true })

    legacyImages?.forEach((img: any) => {
      if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, img.url)
    })
  }

  return imageMap
}
