import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { BrandsClient } from "@/components/brands/brands-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { notFound } from "next/navigation"

const INITIAL_LOAD_LIMIT = 20

export default async function BrandsPage({ params }: { params: { slug?: string[] } }) {
  const supabase = await createClient()

  // Get the brand slug from the URL (e.g., /brands/dior -> "dior")
  const brandSlug = params.slug?.[0]

  // Get the main Brands category
  const { data: brandsCategory } = await supabase.from("categories").select("id").eq("slug", "brands").single()

  if (!brandsCategory) {
    console.error("Brands category not found")
    return <div>Error: Brands category not configured</div>
  }

  // Fetch all brand subcategories
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("parent_id", brandsCategory.id)
    .order("display_order", { ascending: true })

  const categoryData = allCategories || []

  if (categoryData.length === 0) {
    return <div>No brands found</div>
  }

  // Determine which category to load
  let initialCategoryId: string
  let initialCategorySlug: string

  if (brandSlug) {
    // Find the category matching the slug. Supports both the clean public URL
    // (e.g. "celine") and the raw stored slug with its "brands-" prefix
    // (e.g. "brands-celine") for backwards compatibility.
    const selectedCategory = categoryData.find(
      (cat) => cat.slug === brandSlug || cat.slug.replace(/^brands-/, "") === brandSlug,
    )

    if (!selectedCategory) {
      notFound()
    }

    initialCategoryId = selectedCategory.id
    initialCategorySlug = selectedCategory.slug
  } else {
    // Default to the first brand category
    initialCategoryId = categoryData[0].id
    initialCategorySlug = categoryData[0].slug
  }

  // Fetch products for the selected category
  const { data: productCategories, error: pcError } = await supabase
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
    .eq("category_id", initialCategoryId)
    .eq("products.status", "live")
    .order("sort_order", { ascending: true })
    .limit(INITIAL_LOAD_LIMIT)

  if (pcError) {
    console.error("Error fetching products:", pcError)
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

  const { count: totalCount } = await supabase
    .from("product_categories")
    .select("product_id, products!inner(status)", { count: "exact", head: true })
    .eq("category_id", initialCategoryId)
    .eq("products.status", "live")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />

      <StaticNavigation />

      <div className="pt-20">
        <BrandsClient
          initialProducts={optimizedProducts}
          categories={categoryData}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          initialCategorySlug={initialCategorySlug}
        />
      </div>
    </div>
  )
}
