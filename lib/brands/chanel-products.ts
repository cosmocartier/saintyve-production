import { createClient } from "@/lib/supabase/server"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

// Fetches all live Chanel Bag products and optimizes their images the same way
// the main /brands/chanel page does (curated category images first, then the
// default title/second-image fallback). Shared by the Chanel sub-pages so they
// all render identical product cards.
export async function getChanelProducts() {
  const supabase = await createClient()

  const { data: productsData, error: productsError } = await supabase
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

  if (productsError) {
    console.error("Error fetching Chanel products:", productsError)
  }

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
      }
    }) || []

  return optimizedProducts
}
