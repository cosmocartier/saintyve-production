import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { WomensOuterwearClient } from "@/components/womens/womens-outerwear-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { getFilterOptionsForCategory } from "@/app/actions/get-filter-options"

const INITIAL_LOAD_LIMIT = 20
const CATEGORY_NAME = "Womens Outerwear"

export default async function WomensOuterwearPage({
  searchParams,
}: {
  searchParams: { brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }
}) {
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("name", CATEGORY_NAME)
    .single()

  if (!category) {
    console.error(`Category "${CATEGORY_NAME}" not found`)
    return <div>Error: Category not configured</div>
  }

  // Build query with filters
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

  if (searchParams.brand) {
    const brands = searchParams.brand.split(",")
    query = query.in("products.brand", brands)
  }

  if (searchParams.subcategory) {
    const subcategories = searchParams.subcategory.split(",")
    query = query.in("products.sub_category", subcategories)
  }

  if (searchParams.color) {
    const colors = searchParams.color.split(",")
    query = query.in("products.color_filter", colors)
  }

  if (searchParams.style) {
    const styles = searchParams.style.split(",")
    query = query.in("products.style_type", styles)
  }

  const sortParam = searchParams.sort || "recommended"
  if (sortParam === "newest") {
    query = query.order("products(created_at)", { ascending: false })
  } else if (sortParam === "price-low") {
    query = query.order("products(price)", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("products(price)", { ascending: false })
  }

  const fetchLimit = sortParam === "recommended" ? INITIAL_LOAD_LIMIT * 3 : INITIAL_LOAD_LIMIT
  query = query.limit(fetchLimit)

  const { data: productCategories, error: pcError } = await query

  if (pcError) {
    console.error("Error fetching products:", pcError)
  }

  let productsData =
    productCategories?.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    })) || []

  // Sales data for recommended sorting
  const salesData = new Map()
  if (sortParam === "recommended" && productsData.length > 0) {
    const productIds = productsData.map((p: any) => p.id)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity, orders!inner(status)")
      .in("product_id", productIds)
      .in("orders.status", ["paid", "processing", "preparing", "in_transit", "shipped", "delivered"])

    if (orderItems) {
      orderItems.forEach((item: any) => {
        const currentCount = salesData.get(item.product_id) || 0
        salesData.set(item.product_id, currentCount + (item.quantity || 1))
      })
    }
  }

  // Fetch Cloudflare images
  const productsWithCf = productsData.filter((p: any) => p.use_cloudflare_images)
  const cfProductIds = productsWithCf.map((p: any) => p.id)
  const cfImagesMap = new Map<string, any[]>()

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
        cfImagesMap.get(img.product_id)!.push({
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

  let optimizedProducts =
    productsData?.map((product: any) => {
      const images = product.use_cloudflare_images
        ? cfImagesMap.get(product.id) || []
        : product.product_images || []

      const imagesByColor = new Map<string, any>()
      images
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .forEach((img: any) => {
          const colorKey = img.color_name || "default"
          if (!imagesByColor.has(colorKey)) imagesByColor.set(colorKey, img)
        })

      return {
        ...product,
        product_images: Array.from(imagesByColor.values()),
        has_multiple_images: images.length > imagesByColor.size,
      }
    }) || []

  // Smart discovery sorting for "recommended"
  if (sortParam === "recommended" && optimizedProducts.length > 0) {
    const now = new Date()

    const productsWithScore = optimizedProducts.map((product: any) => {
      const salesCount = salesData.get(product.id) || 0
      const daysSinceCreated = Math.max(
        0,
        (now.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24),
      )
      const recencyBoost = daysSinceCreated < 14 ? Math.max(0, (14 - daysSinceCreated) / 14) * 5 : 0
      const salesScore = salesCount > 0 ? Math.log(salesCount + 1) * 3 : 0
      const bestsellerBoost = product.is_bestseller ? 2 : 0
      const newInBoost = product.is_new_in ? 1 : 0
      const priceScore = product.price > 50 && product.price < 200 ? 0.5 : 0
      const randomFactor = Math.random() * 1.5
      const totalScore = salesScore + recencyBoost + bestsellerBoost + newInBoost + priceScore + randomFactor
      return { ...product, _discoveryScore: totalScore, _salesCount: salesCount }
    })

    productsWithScore.sort((a: any, b: any) => b._discoveryScore - a._discoveryScore)

    const diversifiedProducts: any[] = []
    const remaining = [...productsWithScore]
    const recentBrands: string[] = []
    const recentCategories: string[] = []
    const recentPriceTiers: string[] = []

    const getPriceTier = (price: number) => {
      if (price < 50) return "budget"
      if (price < 100) return "mid-low"
      if (price < 200) return "mid-high"
      return "premium"
    }

    while (remaining.length > 0 && diversifiedProducts.length < INITIAL_LOAD_LIMIT) {
      let bestIndex = 0
      let bestDiversityScore = -1

      for (let i = 0; i < Math.min(10, remaining.length); i++) {
        const product = remaining[i]
        let diversityScore = 0
        const brandRecency = recentBrands.indexOf(product.brand)
        if (brandRecency === -1) diversityScore += 3
        else diversityScore -= brandRecency
        const categoryRecency = recentCategories.indexOf(product.sub_category || product.category)
        if (categoryRecency === -1) diversityScore += 2
        else diversityScore -= categoryRecency * 0.5
        const priceTier = getPriceTier(product.price)
        const priceTierRecency = recentPriceTiers.indexOf(priceTier)
        if (priceTierRecency === -1) diversityScore += 1
        else diversityScore -= priceTierRecency * 0.3
        const combinedScore = product._discoveryScore * 0.7 + diversityScore * 0.3
        if (combinedScore > bestDiversityScore) {
          bestDiversityScore = combinedScore
          bestIndex = i
        }
      }

      const selectedProduct = remaining.splice(bestIndex, 1)[0]
      diversifiedProducts.push(selectedProduct)
      recentBrands.unshift(selectedProduct.brand)
      if (recentBrands.length > 5) recentBrands.pop()
      recentCategories.unshift(selectedProduct.sub_category || selectedProduct.category)
      if (recentCategories.length > 5) recentCategories.pop()
      recentPriceTiers.unshift(getPriceTier(selectedProduct.price))
      if (recentPriceTiers.length > 5) recentPriceTiers.pop()
    }

    optimizedProducts = diversifiedProducts
  }

  // Filtered total count
  let countQuery = supabase
    .from("product_categories")
    .select("product_id, products!inner(status)", { count: "exact", head: true })
    .eq("category_id", category.id)
    .eq("products.status", "live")

  if (searchParams.brand) countQuery = countQuery.in("products.brand", searchParams.brand.split(","))
  if (searchParams.subcategory) countQuery = countQuery.in("products.sub_category", searchParams.subcategory.split(","))
  if (searchParams.color) countQuery = countQuery.in("products.color_filter", searchParams.color.split(","))
  if (searchParams.style) countQuery = countQuery.in("products.style_type", searchParams.style.split(","))

  const { count: totalCount } = await countQuery

  const filterOptions = await getFilterOptionsForCategory(category.slug)

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <WomensOuterwearClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          categoryId={category.id}
          filterOptions={filterOptions}
          currentFilters={{
            brands: searchParams.brand?.split(",") || [],
            subcategories: searchParams.subcategory?.split(",") || [],
            colors: searchParams.color?.split(",") || [],
            styles: searchParams.style?.split(",") || [],
            sort: searchParams.sort || "recommended",
          }}
        />
      </div>

      <Footer />
    </div>
  )
}
