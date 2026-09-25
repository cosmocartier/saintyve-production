import type { SupabaseClient } from "@supabase/supabase-js"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

type LegacyImage = { url: string; display_order: number; color_name: string | null }

type OrderItemForImageResolution = {
  id: string
  products: {
    id: string
    use_cloudflare_images?: boolean | null
    product_images?: LegacyImage[] | null
  } | null
  product_variants?: { color?: string | null } | null
}

/**
 * Resolves the primary product image for each order item using the exact same
 * Cloudflare-vs-legacy resolution the Cart Drawer and Order Confirmation page rely on
 * (see app/order-confirmation/[orderId]/page.tsx and components/product-page/product-page-client.tsx):
 * products flagged use_cloudflare_images read their title image from product_images_cf
 * via buildCfUrl(..., "pdp"); everything else falls back to the legacy product_images
 * table, filtered by the purchased variant's color.
 *
 * This is the single server-side entry point for that resolution so the confirmation
 * email renders the same image the customer saw in the cart and on the confirmation page.
 */
export async function resolveOrderItemImages(
  supabase: SupabaseClient,
  items: OrderItemForImageResolution[],
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>()

  const cfProductIds = Array.from(
    new Set(
      items
        .filter((item) => item.products?.use_cloudflare_images && item.products?.id)
        .map((item) => item.products!.id),
    ),
  )

  const cfImagesByProduct = new Map<string, { cf_image_id: string; sort_order: number; title_image: boolean }[]>()

  if (cfProductIds.length > 0) {
    const { data: cfImages, error } = await supabase
      .from("product_images_cf")
      .select("product_id, cf_image_id, sort_order, title_image, role")
      .in("product_id", cfProductIds)
      .not("role", "in", "(category,onwear)")
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("[v0] product_images_cf fetch error:", error)
    } else {
      cfImages?.forEach((img: any) => {
        if (!cfImagesByProduct.has(img.product_id)) cfImagesByProduct.set(img.product_id, [])
        cfImagesByProduct.get(img.product_id)!.push(img)
      })
    }
  }

  for (const item of items) {
    const productId = item.products?.id
    if (!productId) continue

    if (item.products?.use_cloudflare_images) {
      const cfImages = cfImagesByProduct.get(productId) || []
      const titleImage = cfImages.find((img) => img.title_image) || cfImages[0]
      if (titleImage) resolved.set(item.id, buildCfUrl(titleImage.cf_image_id, "pdp"))
      continue
    }

    const legacyImages = item.products?.product_images || []
    if (legacyImages.length === 0) continue

    const color = item.product_variants?.color
    const colorImages = color
      ? legacyImages.filter((img) => img.color_name === color).sort((a, b) => a.display_order - b.display_order)
      : []

    const sortedImages =
      colorImages.length > 0 ? colorImages : [...legacyImages].sort((a, b) => a.display_order - b.display_order)

    if (sortedImages[0]?.url) resolved.set(item.id, sortedImages[0].url)
  }

  return resolved
}
