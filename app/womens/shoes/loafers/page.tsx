import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { WomensShoesClient } from "@/components/womens/womens-shoes-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

const INITIAL_LOAD_LIMIT = 20
const CATEGORY_NAME = "Womens Loafers"

export default async function WomensLoafersPage() {
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
        product_images (
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

  // Fetch images from product_images_cf for products using Cloudflare
  const productsUsingCf = productsData.filter((p: any) => p.use_cloudflare_images)
  const cfProductIds = productsUsingCf.map((p: any) => p.id)

  const cfImagesMap = new Map()
  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("*")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })

    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) {
          cfImagesMap.set(img.product_id, [])
        }
        cfImagesMap.get(img.product_id).push({
          id: img.id,
          url: buildCfUrl(img.cf_image_id, "grid"),
          alt_text: img.alt_text,
          display_order: img.sort_order,
          color_name: img.color_name,
          color_hex: img.color_hex,
        })
      })
    }
  }

  const optimizedProducts =
    productsData?.map((product: any) => ({
      ...product,
      product_images: product.use_cloudflare_images
        ? cfImagesMap.get(product.id) || []
        : product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    })) || []

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
        <WomensShoesClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          categoryId={category.id}
          activeCategoryLabel="Loafers"
          pageTitle="WOMEN'S LOAFERS"
        />
      </div>

      <Footer />
    </div>
  )
}
