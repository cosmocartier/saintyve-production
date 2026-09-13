import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Product, ProductVariant, ProductVideo, FactoryMediaItem } from "@/lib/types/product"
import { ProductPageClient } from "@/components/product-page/product-page-client"
import type { Metadata } from "next"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProduct(slug: string): Promise<{
  product: Product
  variants: ProductVariant[]
  images: {
    id: string
    url: string
    alt_text: string | null
    display_order: number
    color_name: string | null
    color_hex: string | null
    cf_image_id?: string
  }[]
  videos: ProductVideo[]
  factoryMedia: FactoryMediaItem[]
  colorVariants: Array<{
    id: string
    name: string
    slug: string
    color: string | null
    price: number
    primaryImage: string | null
    isCurrentProduct: boolean
  }>
  useCfImages: boolean
} | null> {
  const supabase = await createClient()

  // Fetch product by slug
  const { data: product, error: productError } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (productError || !product) {
    return null
  }

  let groupProducts = []
  if (product.parent_product_name) {
    const { data, error: groupError } = await supabase
      .from("products")
      .select(
        "id, name, slug, color, price, parent_product_name, use_cloudflare_images, product_images(url, display_order)",
      )
      .eq("parent_product_name", product.parent_product_name)
      .eq("status", "live")
      .order("created_at", { ascending: true })

    if (!groupError && data) {
      groupProducts = data
    }
  }

  const cfProductIds = groupProducts.filter((p: any) => p.use_cloudflare_images).map((p: any) => p.id)
  const cfImagesMap = new Map()

  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("product_id, cf_image_id, sort_order, title_image")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })

    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) {
          cfImagesMap.set(img.product_id, [])
        }
        cfImagesMap.get(img.product_id).push(img)
      })
    }
  }

  const colorVariants =
    groupProducts
      ?.map((p: any) => {
        let primaryImageUrl = null

        if (p.use_cloudflare_images && cfImagesMap.has(p.id)) {
          const cfImages = cfImagesMap.get(p.id)
          if (cfImages.length > 0) {
            // Use the Title Image (title_image === true) for this product, falling back to the first sorted image
            const titleImage = cfImages.find((img: any) => img.title_image === true) || cfImages[0]
            primaryImageUrl = buildCfUrl(titleImage.cf_image_id, "grid")
          }
        } else {
          // Sort product_images by display_order to get the first image
          const sortedImages = (p.product_images || []).sort((a: any, b: any) => a.display_order - b.display_order)
          primaryImageUrl = sortedImages[0]?.url || null
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          color: p.color,
          price: p.price,
          primaryImage: primaryImageUrl,
          isCurrentProduct: p.id === product.id,
        }
      })
      .filter((v) => v.color) // Only include products with color defined
      .sort((a, b) => (a.color || "").localeCompare(b.color || "")) || []

  // Fetch variants for this product
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("size", { ascending: true })

  if (variantsError) {
    console.error("Error fetching variants:", variantsError)
  }

  let useCfImages = false
  let images: any[] = []

  if (product.use_cloudflare_images) {
    // Check if CF images exist
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    if (cfImages && cfImages.length > 0) {
      useCfImages = true
      images = cfImages
        .filter((img) => !img.title_image) // Exclude the Title Image from the gallery
        .map((img, index) => ({
          id: img.id,
          url: buildCfUrl(img.cf_image_id, "pdp"), // Keep for backwards compatibility
          cf_image_id: img.cf_image_id, // Include the ID for lightbox
          alt_text: img.alt_text,
          display_order: img.sort_order,
          color_name: null,
          color_hex: null,
        }))
    }
  }

  if (!useCfImages) {
    const { data: legacyImages, error: imagesError } = await supabase
      .from("product_images")
      .select("id, url, alt_text, display_order, color_name, color_hex")
      .eq("product_id", product.id)
      .order("display_order", { ascending: true })

    if (imagesError) {
      console.error("Error fetching images:", imagesError)
    }
    images = legacyImages || []
  }

  const { data: videos, error: videosError } = await supabase
    .from("product_videos")
    .select("*")
    .eq("product_id", product.id)
    .order("display_order", { ascending: true })

  if (videosError) {
    console.error("Error fetching videos:", videosError)
  }

  // Factory Media: fully separate from the gallery/video systems above, scoped to this product only.
  const { data: factoryMedia, error: factoryMediaError } = await supabase
    .from("product_factory_media")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true })

  if (factoryMediaError) {
    console.error("Error fetching factory media:", factoryMediaError)
  }

  return {
    product,
    variants: variants || [],
    images,
    videos: videos || [],
    factoryMedia: factoryMedia || [],
    colorVariants,
    useCfImages,
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getProduct(slug)

  if (!data) {
    return {
      title: "Product Not Found",
    }
  }

  const { product, images } = data
  const firstImage = images[0]?.url || product.image

  // Extract brand name from product name (assumes format: "Brand ProductName")
  const brandName = product.name.split(" ")[0] || ""
  const autoTitle = `${product.name} – Premium Quality & Fast Shipping | SAINT YVE`

  // Use custom meta_title if set, otherwise use auto-generated format
  const title = product.meta_title || autoTitle

  const autoDescription = `Discover the ${brandName} ${product.name}. Premium materials, AA+ craftsmanship, perfect details, fast worldwide shipping. Shop the highest-grade version.`
  const description = product.meta_description || autoDescription

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: description,
      images: [firstImage],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const data = await getProduct(slug)

  if (!data) {
    notFound()
  }

  const { product, variants, images, videos, factoryMedia, colorVariants, useCfImages } = data

  return (
    <ProductPageClient
      product={product}
      variants={variants}
      images={images}
      videos={videos}
      factoryMedia={factoryMedia}
      colorVariants={colorVariants}
      useCfImages={useCfImages}
    />
  )
}
