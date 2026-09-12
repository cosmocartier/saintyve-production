import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { ChanelClient } from "@/components/brands/chanel-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

const INITIAL_LOAD_LIMIT = 20

export const metadata: Metadata = {
  title: "Chanel | Saint Yve",
  description:
    "Discover Chanel's timeless luxury fashion and accessories. From iconic handbags to elegant ready-to-wear, explore French sophistication and unparalleled craftsmanship.",
}

export default async function ChanelPage() {
  const supabase = await createClient()

  // Build the main products query - Bag category only
  const query = supabase
    .from("products")
    .select(`
      *,
      product_variants (
        id,
        size,
        stock_quantity
      ),
      product_images_cf (
        id,
        cf_image_id,
        alt_text,
        sort_order,
        role
      )
    `)
    .eq("brand", "Chanel")
    .eq("status", "live")
    .eq("category", "Bag")
    .order("created_at", { ascending: false })
    .limit(INITIAL_LOAD_LIMIT)

  const { data: productsData, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching Chanel products:", productsError)
  }

  // Optimize images - convert CF image IDs to URLs
  const optimizedProducts =
    productsData?.map((product: any) => {
      const sortedImages =
        product.product_images_cf
          ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .slice(0, 2)
          .map((img: any) => ({
            id: img.id,
            url: buildCfUrl(img.cf_image_id, "grid"),
            alt_text: img.alt_text,
            display_order: img.sort_order,
            color_name: img.color_name,
            color_hex: img.color_hex,
          })) || []

      return {
        ...product,
        product_images: sortedImages,
        has_multiple_images: sortedImages.length > 1,
      }
    }) || []

  // Get total count
  const { count: totalCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand", "Chanel")
    .eq("status", "live")
    .eq("category", "Bag")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <ChanelClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
        />
      </div>

      <Footer />
    </div>
  )
}
