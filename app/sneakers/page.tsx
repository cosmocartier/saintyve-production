import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { SneakersClient } from "@/components/category-pages/sneakers/sneakers-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { getFilterOptionsForCategory } from "@/app/actions/get-filter-options"

const INITIAL_LOAD_LIMIT = 20

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }
}): Promise<Metadata> {
  const hasActiveFilters = Boolean(searchParams.brand || searchParams.subcategory || searchParams.color || searchParams.style || searchParams.sort)

  return {
    title: "Designer Sneakers (AA+ Quality) | Designerdrip",
    description:
      "Shop premium designer sneakers with AA+ craftsmanship — Jordan, Nike, Balenciaga & more. Fast worldwide shipping. New drops weekly.",
    openGraph: {
      title: "Designer Sneakers (AA+ Quality) | Designerdrip",
      description:
        "Shop premium designer sneakers with AA+ craftsmanship — Jordan, Nike, Balenciaga & more. Fast worldwide shipping. New drops weekly.",
      type: "website",
      url: "https://designerdrip.com/sneakers",
    },
    twitter: {
      card: "summary_large_image",
      title: "Designer Sneakers (AA+ Quality) | Designerdrip",
      description:
        "Shop premium designer sneakers with AA+ craftsmanship — Jordan, Nike, Balenciaga & more. Fast worldwide shipping. New drops weekly.",
    },
    alternates: {
      canonical: "https://designerdrip.com/sneakers",
    },
    robots: {
      index: !hasActiveFilters,
      follow: true,
    },
  }
}

export default async function SneakersPage({
  searchParams,
}: {
  searchParams: { brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }
}) {
  const supabase = await createClient()

  const { data: sneakersCategory } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", "sneakers")
    .single()

  if (!sneakersCategory) {
    console.error("Sneakers category not found")
    return <div>Error: Sneakers category not configured</div>
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
    .eq("category_id", sneakersCategory.id)
    .eq("products.status", "live")

  // Apply filters from URL params
  if (searchParams.brand) {
    const brands = searchParams.brand.split(',')
    query = query.in("products.brand", brands)
  }
  
  if (searchParams.subcategory) {
    const subcategories = searchParams.subcategory.split(',')
    query = query.in("products.sub_category", subcategories)
  }

  if (searchParams.color) {
    const colors = searchParams.color.split(',')
    query = query.in("products.color_filter", colors)
  }

  if (searchParams.style) {
    const styles = searchParams.style.split(',')
    query = query.in("products.style_type", styles)
  }

  // Apply sorting
  const sortParam = searchParams.sort || "recommended"
  if (sortParam === "newest") {
    query = query.order("products(created_at)", { ascending: false })
  } else if (sortParam === "price-low") {
    query = query.order("products(price)", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("products(price)", { ascending: false })
  } else if (sortParam === "recommended") {
    // For recommended, we'll fetch more products and sort them algorithmically
    // No database ordering - we'll handle this in-memory after fetching
  } else {
    query = query.order("products(created_at)", { ascending: false })
  }

  // Fetch more products for recommended sort to allow for better algorithmic sorting
  const fetchLimit = sortParam === "recommended" ? INITIAL_LOAD_LIMIT * 3 : INITIAL_LOAD_LIMIT
  query = query.limit(fetchLimit)

  const { data: productCategories, error: pcError } = await query

  if (pcError) {
    console.error("Error fetching sneakers:", pcError)
  }

  let productsData =
    productCategories?.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    })) || []

  // Get sales data for recommended sorting
  let salesData = new Map()
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

  let optimizedProducts =
    productsData?.map((product: any) => ({
      ...product,
      product_images: product.use_cloudflare_images
        ? cfImagesMap.get(product.id) || []
        : product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    })) || []

  // Apply smart discovery sorting for "recommended"
  if (sortParam === "recommended" && optimizedProducts.length > 0) {
    const now = new Date()
    
    // Calculate smart score for each product
    const productsWithScore = optimizedProducts.map((product: any) => {
      const salesCount = salesData.get(product.id) || 0
      const daysSinceCreated = Math.max(0, (now.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24))
      
      // Recency boost: products less than 14 days old get a boost
      const recencyBoost = daysSinceCreated < 14 ? Math.max(0, (14 - daysSinceCreated) / 14) * 5 : 0
      
      // Sales score: logarithmic to prevent top sellers from dominating
      const salesScore = salesCount > 0 ? Math.log(salesCount + 1) * 3 : 0
      
      // Bestseller badge boost
      const bestsellerBoost = product.is_bestseller ? 2 : 0
      
      // New in badge boost (smaller than recency to avoid duplication)
      const newInBoost = product.is_new_in ? 1 : 0
      
      // Price variety score (prefer mid-range items slightly)
      const priceScore = product.price > 50 && product.price < 200 ? 0.5 : 0
      
      // Random element for freshness (small impact)
      const randomFactor = Math.random() * 1.5
      
      const totalScore = salesScore + recencyBoost + bestsellerBoost + newInBoost + priceScore + randomFactor
      
      return {
        ...product,
        _discoveryScore: totalScore,
        _salesCount: salesCount,
      }
    })
    
    // Sort by score
    productsWithScore.sort((a: any, b: any) => b._discoveryScore - a._discoveryScore)
    
    // Apply diversity mixing to prevent brand/category clustering
    const diversifiedProducts = []
    const remaining = [...productsWithScore]
    const recentBrands: string[] = []
    const recentCategories: string[] = []
    const recentPriceTiers: string[] = []
    
    const getPriceTier = (price: number) => {
      if (price < 50) return 'budget'
      if (price < 100) return 'mid-low'
      if (price < 200) return 'mid-high'
      return 'premium'
    }
    
    // First pass: pick products ensuring diversity
    while (remaining.length > 0 && diversifiedProducts.length < INITIAL_LOAD_LIMIT) {
      let bestIndex = 0
      let bestDiversityScore = -1
      
      // Find the best product that adds diversity
      for (let i = 0; i < Math.min(10, remaining.length); i++) {
        const product = remaining[i]
        let diversityScore = 0
        
        // Penalize if brand was recently shown
        const brandRecency = recentBrands.indexOf(product.brand)
        if (brandRecency === -1) {
          diversityScore += 3
        } else {
          diversityScore -= brandRecency
        }
        
        // Penalize if category was recently shown
        const categoryRecency = recentCategories.indexOf(product.sub_category || product.category)
        if (categoryRecency === -1) {
          diversityScore += 2
        } else {
          diversityScore -= categoryRecency * 0.5
        }
        
        // Penalize if price tier was recently shown
        const priceTier = getPriceTier(product.price)
        const priceTierRecency = recentPriceTiers.indexOf(priceTier)
        if (priceTierRecency === -1) {
          diversityScore += 1
        } else {
          diversityScore -= priceTierRecency * 0.3
        }
        
        // Combine with original score (weighted)
        const combinedScore = product._discoveryScore * 0.7 + diversityScore * 0.3
        
        if (combinedScore > bestDiversityScore) {
          bestDiversityScore = combinedScore
          bestIndex = i
        }
      }
      
      // Add the best diverse product
      const selectedProduct = remaining.splice(bestIndex, 1)[0]
      diversifiedProducts.push(selectedProduct)
      
      // Update recency trackers (keep last 5)
      recentBrands.unshift(selectedProduct.brand)
      if (recentBrands.length > 5) recentBrands.pop()
      
      recentCategories.unshift(selectedProduct.sub_category || selectedProduct.category)
      if (recentCategories.length > 5) recentCategories.pop()
      
      recentPriceTiers.unshift(getPriceTier(selectedProduct.price))
      if (recentPriceTiers.length > 5) recentPriceTiers.pop()
    }
    
    optimizedProducts = diversifiedProducts
  }

  // Get total count with same filters applied
  let countQuery = supabase
    .from("product_categories")
    .select("product_id, products!inner(status)", { count: "exact", head: true })
    .eq("category_id", sneakersCategory.id)
    .eq("products.status", "live")

  if (searchParams.brand) {
    const brands = searchParams.brand.split(',')
    countQuery = countQuery.in("products.brand", brands)
  }
  
  if (searchParams.subcategory) {
    const subcategories = searchParams.subcategory.split(',')
    countQuery = countQuery.in("products.sub_category", subcategories)
  }

  if (searchParams.color) {
    const colors = searchParams.color.split(',')
    countQuery = countQuery.in("products.color_filter", colors)
  }

  if (searchParams.style) {
    const styles = searchParams.style.split(',')
    countQuery = countQuery.in("products.style_type", styles)
  }

  const { count: totalCount } = await countQuery

  // Fetch all filter options server-side for the entire category
  const filterOptions = await getFilterOptionsForCategory(sneakersCategory.id)

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <SneakersClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          categoryId={sneakersCategory.id}
          filterOptions={filterOptions}
          currentFilters={{
            brands: searchParams.brand?.split(',') || [],
            subcategories: searchParams.subcategory?.split(',') || [],
            colors: searchParams.color?.split(',') || [],
            styles: searchParams.style?.split(',') || [],
            sort: searchParams.sort || "recommended",
          }}
        />
      </div>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://designerdrip.store",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Sneakers",
                item: "https://designerdrip.store/sneakers",
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: optimizedProducts.slice(0, 10).map((product: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `https://designerdrip.com/products/${product.slug}`,
              name: product.name,
            })),
          }),
        }}
      />
    </div>
  )
}
