import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ReviewsPageClient } from "@/components/admin/reviews/reviews-page-client"
import { resolvePrimaryImages } from "@/lib/products/resolve-primary-images"
import type { AdminReview } from "@/lib/types/review"

const ITEMS_PER_PAGE = 20

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  const {
    data: reviewRows,
    error: reviewsError,
    count,
  } = await supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1)

  if (reviewsError) {
    console.error("[v0] Error fetching reviews:", reviewsError)
  }

  const rows = reviewRows ?? []
  const productIds = Array.from(new Set(rows.map((r) => r.product_id).filter((id): id is string => Boolean(id))))

  let productMap = new Map<string, { id: string; name: string; slug: string }>()
  let imageMap = new Map<string, string>()

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, slug, use_cloudflare_images")
      .in("id", productIds)

    if (products) {
      products.forEach((p) => productMap.set(p.id, { id: p.id, name: p.name, slug: p.slug }))
      imageMap = await resolvePrimaryImages(supabase, products)
    }
  }

  const reviews: AdminReview[] = rows.map((row) => {
    const product = row.product_id ? productMap.get(row.product_id) : null
    return {
      ...row,
      media: row.media ?? [],
      product: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: imageMap.get(product.id) ?? null,
          }
        : null,
    }
  })

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <AdminSidebar userEmail={user.email || ""} />

      <div className="flex-1 p-8">
        <ReviewsPageClient initialReviews={reviews} totalCount={count || 0} />
      </div>
    </div>
  )
}
