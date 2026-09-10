import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { MensOuterwearClient } from "@/components/mens/mens-outerwear-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"

const INITIAL_LOAD_LIMIT = 20
const CATEGORY_NAME = "Mens Vests"

export default async function MensVestsPage() {
  const supabase = await createClient()

  const { data: category } = await supabase.from("categories").select("id").eq("name", CATEGORY_NAME).single()

  if (!category) {
    console.error(`Category "${CATEGORY_NAME}" not found`)
    return <div>Error: Category not configured</div>
  }

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
    .eq("category_id", category.id)
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
    .eq("category_id", category.id)
    .eq("products.status", "live")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <MensOuterwearClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          categoryId={category.id}
          activeCategoryLabel="Vest"
          pageTitle="MEN'S VESTS"
        />
      </div>

      <Footer />
    </div>
  )
}
