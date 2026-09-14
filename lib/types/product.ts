export interface Product {
  id: string
  slug: string
  name: string
  model?: string | null
  color?: string | null
  description: string | null
  price: number
  /** Manufacturer suggested retail price shown crossed-out for price-mode toggle */
  retail_price?: number | null
  /**
   * Optional sale/discounted price.
   * - NULL / undefined → no discount, show `price` only
   * - number → show this as the primary price with `price` crossed out
   */
  discounted_price?: number | null
  category: string
  category_id?: string | null // Added category_id field for new category system
  image: string
  status?: "live" | "draft"
  created_at: string
  updated_at: string
  has_multiple_images?: boolean
  product_details?: string | null
  size_and_fit?: string | null
  materials_and_care?: string | null
  our_commitment?: string | null
  seo_keywords?: string | null
  is_bestseller?: boolean
  is_new_in?: boolean
  replication_accuracy?: number | null
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  sku: string
  stock_quantity: number
  price_adjustment: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  display_order: number
  color_name: string | null
  color_hex: string | null
  created_at: string
}

export interface ProductVideo {
  id: string
  product_id: string
  video_url: string
  display_order: number
  created_at: string
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
  images: ProductImage[]
  videos?: ProductVideo[] // Added videos array
}

export interface ColorVariant {
  name: string
  hex: string
  images: ProductImage[]
  variants: ProductVariant[]
}

/**
 * Factory Media: a fully separate media system from ProductImage (gallery) and ProductVideo.
 * Additional factory photos/videos surfaced via a dedicated storefront CTA + lightbox,
 * instead of the default "Request additional photos" WhatsApp link.
 */
export interface FactoryMediaItem {
  id: string
  product_id: string
  media_type: "image" | "video"
  cf_image_id: string | null
  video_url: string | null
  alt_text: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}
