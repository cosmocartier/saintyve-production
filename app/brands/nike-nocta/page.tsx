import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { NikeNoctaClient } from "@/components/brands/nike-nocta-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"

const INITIAL_LOAD_LIMIT = 20

export const metadata: Metadata = {
  title: "Nike Nocta | Designerdrip",
  description:
    "Nike Nocta blends Nike performance with Drake's nocturnal aesthetic—engineered for movement, focus, and modern silhouettes.",
}

export default async function NikeNoctaPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const supabase = await createClient()

  // Find the Nike x Nocta category
  const { data: noctaCategory } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", "nike-x-nocta")
    .single()

  if (!noctaCategory) {
    console.error("Nike x Nocta category not found")
    notFound()
  }

  const { data: availableCategoriesData } = await supabase
    .from("product_categories")
    .select(`
      products!inner (
        category
      )
    `)
    .eq("category_id", noctaCategory.id)
    .eq("products.status", "live")

  // Extract unique categories that have products
  const availableCategories = [
    ...new Set(
      availableCategoriesData?.map((pc: any) => pc.products.category).filter((cat: string | null) => cat !== null) ||
        [],
    ),
  ].sort()

  let query = supabase
    .from("product_categories")
    .select(`
      product_id,
      sort_order,
      products!inner (
        *,
        product_variants (
          id,
          size,
          stock_quantity
        ),
        product_images!inner (
          id,
          url,
          alt_text,
          display_order,
          color_name,
          color_hex
        )
      )
    `)
    .eq("category_id", noctaCategory.id)
    .eq("products.status", "live")

  if (searchParams.category) {
    query = query.eq("products.category", searchParams.category)
  }

  const sortParam = searchParams.sort || "newest"
  if (sortParam === "price-low") {
    query = query.order("products(price)", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("products(price)", { ascending: false })
  } else {
    query = query.order("sort_order", { ascending: true })
  }

  query = query.limit(INITIAL_LOAD_LIMIT)

  const { data: productCategories, error: pcError } = await query

  if (pcError) {
    console.error("Error fetching Nike Nocta products:", pcError)
  }

  const productsData =
    productCategories?.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    })) || []

  const optimizedProducts =
    productsData?.map((product: any) => {
      const imagesByColor = new Map<string, any>()

      product.product_images
        ?.sort((a: any, b: any) => a.display_order - b.display_order)
        .forEach((img: any) => {
          const colorKey = img.color_name || "default"
          if (!imagesByColor.has(colorKey)) {
            imagesByColor.set(colorKey, img)
          }
        })

      return {
        ...product,
        product_images: Array.from(imagesByColor.values()),
        has_multiple_images: (product.product_images?.length || 0) > imagesByColor.size,
      }
    }) || []

  let countQuery = supabase
    .from("product_categories")
    .select("product_id, products!inner(status, category)", { count: "exact", head: true })
    .eq("category_id", noctaCategory.id)
    .eq("products.status", "live")

  if (searchParams.category) {
    countQuery = countQuery.eq("products.category", searchParams.category)
  }

  const { count: totalCount } = await countQuery

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <NikeNoctaClient
          initialProducts={optimizedProducts}
          categoryId={noctaCategory.id}
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
