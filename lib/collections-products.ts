import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

// Mirrors the image-optimization logic used by the /brands/chanel sub-pages
// (see lib/brands/chanel-products.ts) so /collections renders identical
// product cards: curated category_brand images first, otherwise a capped
// title + second image fallback. Shared between the server page and the
// client component (initial restore + infinite-scroll load-more) so every
// entry point into /collections optimizes images the same way.
export function optimizeCollectionsProductImages(product: any) {
  if (product.use_cloudflare_images) {
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
        .filter((img: any, index: number, arr: any[]) => arr.findIndex((i) => i.id === img.id) === index)
        .map((img: any) => ({
          id: img.id,
          url: buildCfUrl(img.cf_image_id, "grid"),
          alt_text: img.alt_text,
          display_order: img.sort_order,
        }))
    }

    return {
      ...product,
      product_images: displayImages,
      has_multiple_images: displayImages.length > 1,
    }
  }

  // Legacy (non-Cloudflare) products: cap to the first two images by display order.
  const sortedLegacy = (product.product_images || [])
    .slice()
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
  const displayImages = sortedLegacy.slice(0, 2)

  return {
    ...product,
    product_images: displayImages,
    has_multiple_images: displayImages.length > 1,
  }
}
