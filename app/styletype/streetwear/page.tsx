import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { StyleTypeClient } from "@/components/styletype/styletype-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { STYLE_TYPES } from "@/lib/style-types"

const INITIAL_LOAD_LIMIT = 20
const STYLE_TYPE_NAME = "Streetwear"
const STYLE_TYPE_SLUG = "streetwear"

export const metadata = {
  title: "Streetwear | Designerdrip",
  description: "Shop the Streetwear edit — the latest streetwear-style pieces from Designerdrip.",
}

export default async function StreetwearPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
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
    .eq("style_type", STYLE_TYPE_NAME)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(INITIAL_LOAD_LIMIT)

  if (error) {
    console.error("Error fetching streetwear products:", error)
  }

  const productsData = products || []

  const cfProductIds = productsData.filter((p: any) => p.use_cloudflare_images).map((p: any) => p.id)
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

  const optimizedProducts = productsData.map((product: any) => {
    const images = product.use_cloudflare_images ? cfImagesMap.get(product.id) || [] : product.product_images || []

    const imagesByColor = new Map<string, any>()

    images
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .forEach((img: any) => {
        const colorKey = img.color_name || "default"
        if (!imagesByColor.has(colorKey)) {
          imagesByColor.set(colorKey, img)
        }
      })

    return {
      ...product,
      product_images: Array.from(imagesByColor.values()),
      has_multiple_images: images.length > imagesByColor.size,
    }
  })

  const { count: totalCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("style_type", STYLE_TYPE_NAME)
    .eq("status", "live")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />

      <StaticNavigation />

      <div className="pt-20">
        <StyleTypeClient
          initialProducts={optimizedProducts}
          categories={STYLE_TYPES}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          currentStyleSlug={STYLE_TYPE_SLUG}
          currentStyleName={STYLE_TYPE_NAME}
        />
      </div>

      <Footer />
    </div>
  )
}
