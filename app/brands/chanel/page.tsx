import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { ChanelClient } from "@/components/brands/chanel-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

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
        role,
        category_image
      )
    `)
    .eq("brand", "Chanel")
    .eq("status", "live")
    .eq("category", "Bag")
    .order("created_at", { ascending: false })

  const { data: productsData, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching Chanel products:", productsError)
  }

  // Count color variants per model group (siblings sharing parent_product_name
  // with a defined color) — mirrors the color-swatch logic on the product detail page.
  const colorCountByParent = new Map<string, number>()
  productsData?.forEach((p: any) => {
    if (p.parent_product_name && p.color) {
      colorCountByParent.set(p.parent_product_name, (colorCountByParent.get(p.parent_product_name) || 0) + 1)
    }
  })

  // Optimize images - convert CF image IDs to URLs
  const optimizedProducts =
    productsData?.map((product: any) => {
      const allImages = product.product_images_cf || []

      // Category/Brand-page-specific images, curated separately from the
      // default product-page images. When present, these take priority.
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
        // Fallback: default product-page images (title + second image)
        const sortedByOrder = allImages
          .filter((img: any) => !img.category_image)
          .slice()
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

        // First image = the Title Image (role === "primary")
        const titleImage = sortedByOrder.find((img: any) => img.role === "primary") || sortedByOrder[0]

        // Second image = the actual second image in sort order (not the first), excluding the title image
        const secondImage = sortedByOrder.find((img: any) => img.id !== titleImage?.id) || sortedByOrder[1]

        displayImages = [titleImage, secondImage]
          .filter(Boolean)
          .filter((img, index, arr) => arr.findIndex((i) => i.id === img.id) === index)
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
        colorVariantCount:
          product.parent_product_name && product.color
            ? colorCountByParent.get(product.parent_product_name) || 1
            : 1,
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

      <div className="pt-12 md:pt-14 lg:pt-20">
        <ChanelClient initialProducts={optimizedProducts} />
      </div>

      <Footer />
    </div>
  )
}
