import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { MiuMiuClient } from "@/components/brands/miu-miu-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

const INITIAL_LOAD_LIMIT = 20

export const metadata: Metadata = {
  title: "Miu Miu | Saint Yve",
  description:
    "Discover the playful elegance of Miu Miu. From bold accessories to daring fashion, explore Prada's rebellious younger sister brand and contemporary Italian luxury.",
}

export default async function MiuMiuPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const supabase = await createClient()

  // Get available categories for Miu Miu products
  const { data: availableCategoriesData } = await supabase
    .from("products")
    .select("category")
    .eq("brand", "MiuMiu")
    .eq("status", "live")
    .not("category", "is", null)

  const availableCategories = [
    ...new Set(availableCategoriesData?.map((p: any) => p.category).filter((cat: string | null) => cat !== null) || []),
  ].sort()

  // Build the main products query
  let query = supabase
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
    .eq("brand", "MiuMiu")
    .eq("status", "live")

  if (searchParams.category) {
    query = query.eq("category", searchParams.category)
  }

  const sortParam = searchParams.sort || "newest"
  if (sortParam === "price-low") {
    query = query.order("price", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  query = query.limit(INITIAL_LOAD_LIMIT)

  const { data: productsData, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching Miu Miu products:", productsError)
  }

  // Optimize images - convert CF image IDs to URLs
  const optimizedProducts =
    productsData?.map((product: any) => {
      const sortedImages = product.product_images_cf
        ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
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
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand", "MiuMiu")
    .eq("status", "live")

  if (searchParams.category) {
    countQuery = countQuery.eq("category", searchParams.category)
  }

  const { count: totalCount } = await countQuery

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <MiuMiuClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          currentCategory={searchParams.category || ""}
          currentSort={searchParams.sort || "newest"}
          availableCategories={availableCategories}
        />
      </div>

      <Footer />
    </div>
  )
}
