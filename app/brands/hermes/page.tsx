import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { HermesClient } from "@/components/brands/hermes-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

export const metadata: Metadata = {
  title: "Hermes | Saint Yve",
  description:
    "Discover Hermes's timeless luxury fashion and accessories. From iconic handbags to elegant ready-to-wear, explore French sophistication and unparalleled craftsmanship.",
}

export default async function HermesPage() {
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
        role,
        category_image
      )
    `)
    .in("brand", ["Hermès", "Hermes"])
    .eq("status", "live")
    .eq("category", "Bag")
    .order("created_at", { ascending: false })

  const { data: productsData, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching Hermes products:", productsError)
  }

  // Optimize images - convert CF image IDs to URLs
  const optimizedProducts =
    productsData?.map((product: any) => {
      const allImages = product.product_images_cf || []
      const categoryImages = allImages
        .filter((img: any) => img.category_image === true)
        .slice()
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

      let displayImages: any[]

      if (categoryImages.length > 0) {
        displayImages = categoryImages.map((img: any) => ({
          id: img.id,
          url: buildCfUrl(img.cf_image_id, "grid"),
          alt_text: img.alt_text,
          display_order: img.sort_order,
        }))
      } else {
        const sortedByOrder = allImages
          .filter((img: any) => !img.category_image)
          .slice()
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        const titleImage = sortedByOrder.find((img: any) => img.role === "primary") || sortedByOrder[0]
        const secondImage = sortedByOrder.find((img: any) => img.id !== titleImage?.id) || sortedByOrder[1]

        displayImages = [titleImage, secondImage]
          .filter(Boolean)
          .filter((img, index, arr) => arr.findIndex((item) => item.id === img.id) === index)
          .map((img: any) => ({
            id: img.id,
            url: buildCfUrl(img.cf_image_id, "grid"),
            alt_text: img.alt_text,
            display_order: img.sort_order,
            color_name: img.color_name,
            color_hex: img.color_hex,
          }))
      }

      return {
        ...product,
        product_images: displayImages,
        has_multiple_images: displayImages.length > 1,
      }
    }) || []

  // Get total count
  const { count: totalCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("brand", ["Hermès", "Hermes"])
    .eq("status", "live")
    .eq("category", "Bag")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <HermesClient initialProducts={optimizedProducts} />
      </div>

      <Footer />
    </div>
  )
}
