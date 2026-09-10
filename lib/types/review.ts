export interface ReviewProduct {
  id: string
  name: string
  slug: string
  image: string | null
}

export interface Review {
  id: string
  customer_name: string
  review_date: string
  title: string | null
  review: string
  country: string
  rating: number
  product: ReviewProduct | null
  media: ReviewMediaItem[]
  created_at: string
}

export type ReviewSortOrder = "recent" | "oldest"

export interface ReviewsResponse {
  reviews: Review[]
  total: number
  hasMore: boolean
  averageRating: number | null
}

/** A single Cloudflare Images reference stored on reviews.media (jsonb array). */
export interface ReviewMediaItem {
  id: string
  cf_image_id: string
  alt_text: string | null
  sort_order: number
}

/** Full review row shape as used in the admin dashboard. */
export interface AdminReview {
  id: string
  customer_name: string
  review_date: string
  title: string | null
  review: string
  country: string
  rating: number
  product_id: string | null
  published: boolean
  media: ReviewMediaItem[]
  created_at: string
  product?: ReviewProduct | null
}
