import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { MensShoesClient } from "@/components/mens/mens-shoes-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { getFilterOptionsForCategory } from "@/app/actions/get-filter-options"

const INITIAL_LOAD_LIMIT = 20
const CATEGORY_NAME = "Mens Shoes"

export default async function MensShoesPage({
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

  let query = supabase
    .from("product_categories")
    .select(`
      product_id,
      sort_order,
      products!inner (
        *,
        product_variants (id, size, stock_quantity),
        product_images (id, url, alt_text, display_order, color_name, color_hex)
      )
    `)
    .eq("category_id", category.id)
    .eq("products.status", "live")

  if (searchParams.brand) query = query.in("products.brand", searchParams.brand.split(","))
  if (searchParams.subcategory) query = query.in("products.sub_category", searchParams.subcategory.split(","))
  if (searchParams.color) query = query.in("products.color_filter", searchParams.color.split(","))
  if (searchParams.style) query = query.in("products.style_type", searchParams.style.split(","))

  const sortParam = searchParams.sort || "recommended"
  if (sortParam === "newest") query = query.order("products(created_at)", { ascending: false })
  else if (sortParam === "price-low") query = query.order("products(price)", { ascending: true })
  else if (sortParam === "price-high") query = query.order("products(price)", { ascending: false })

  const fetchLimit = sortParam === "recommended" ? INITIAL_LOAD_LIMIT * 3 : INITIAL_LOAD_LIMIT
  query = query.limit(fetchLimit)

  const { data: productCategories, error: pcError } = await query
  if (pcError) console.error("Error fetching products:", pcError)

  let productsData =
    productCategories?.map((pc: any) => ({ ...pc.products, sort_order: pc.sort_order })) || []

  // Sales data for recommended sort
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
        salesData.set(item.product_id, (salesData.get(item.product_id) || 0) + (item.quantity || 1))
      })
    }
  }

  // Cloudflare images
  const cfProductIds = productsData.filter((p: any) => p.use_cloudflare_images).map((p: any) => p.id)
  const cfImagesMap = new Map<string, any[]>()
  if (cfProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("*")
      .in("product_id", cfProductIds)
      .order("sort_order", { ascending: true })
    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) cfImagesMap.set(img.product_id, [])
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

  let optimizedProducts = productsData.map((product: any) => {
    const images = product.use_cloudflare_images
      ? cfImagesMap.get(product.id) || []
      : product.product_images || []
    const imagesByColor = new Map<string, any>()
    images.sort((a: any, b: any) => a.display_order - b.display_order).forEach((img: any) => {
      const colorKey = img.color_name || "default"
      if (!imagesByColor.has(colorKey)) imagesByColor.set(colorKey, img)
    })
    return {
      ...product,
      product_images: Array.from(imagesByColor.values()),
      has_multiple_images: images.length > imagesByColor.size,
    }
  })

  // Smart recommended sort
  if (sortParam === "recommended" && optimizedProducts.length > 0) {
    const now = new Date()
    const getPriceTier = (price: number) =>
      price < 50 ? "budget" : price < 100 ? "mid-low" : price < 200 ? "mid-high" : "premium"
    const scored = optimizedProducts.map((p: any) => {
      const days = Math.max(0, (now.getTime() - new Date(p.created_at).getTime()) / 86400000)
      const score =
        Math.log((salesData.get(p.id) || 0) + 1) * 3 +
        (days < 14 ? ((14 - days) / 14) * 5 : 0) +
        (p.is_bestseller ? 2 : 0) +
        (p.is_new_in ? 1 : 0) +
        (p.price > 50 && p.price < 200 ? 0.5 : 0) +
        Math.random() * 1.5
      return { ...p, _score: score }
    })
    scored.sort((a: any, b: any) => b._score - a._score)
    const diversified: any[] = []
    const remaining = [...scored]
    const recentBrands: string[] = []
    const recentCats: string[] = []
    const recentTiers: string[] = []
    while (remaining.length > 0 && diversified.length < INITIAL_LOAD_LIMIT) {
      let bestIdx = 0
      let bestScore = -1
      for (let i = 0; i < Math.min(10, remaining.length); i++) {
        const p = remaining[i]
        const tier = getPriceTier(p.price)
        const d =
          (recentBrands.includes(p.brand) ? -recentBrands.indexOf(p.brand) : 3) +
          (recentCats.includes(p.sub_category) ? -recentCats.indexOf(p.sub_category) * 0.5 : 2) +
          (recentTiers.includes(tier) ? -recentTiers.indexOf(tier) * 0.3 : 1)
        const combined = p._score * 0.7 + d * 0.3
        if (combined > bestScore) { bestScore = combined; bestIdx = i }
      }
      const sel = remaining.splice(bestIdx, 1)[0]
      diversified.push(sel)
      recentBrands.unshift(sel.brand); if (recentBrands.length > 5) recentBrands.pop()
      recentCats.unshift(sel.sub_category); if (recentCats.length > 5) recentCats.pop()
      recentTiers.unshift(getPriceTier(sel.price)); if (recentTiers.length > 5) recentTiers.pop()
    }
    optimizedProducts = diversified
  }

  // Filtered count
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
        <MensShoesClient
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
