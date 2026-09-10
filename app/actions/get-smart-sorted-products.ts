"use server"

import { createClient } from "@/lib/supabase/server"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface SmartSortParams {
  categoryId: string
  offset: number
  limit: number
  brands?: string[]
  subcategories?: string[]
  colors?: string[]
  styles?: string[]
  search?: string
}

/**
 * Smart discovery sorting algorithm for product recommendations
 * This combines multiple signals to create a dynamic, engaging product order:
 * - Sales performance (logarithmic to prevent top sellers from dominating)
 * - Recency boost for new products
 * - Bestseller and new-in badges
 * - Price variety to show different tiers
 * - Diversity mixing to prevent brand/category clustering
 * - Small random element for freshness
 */
export async function getSmartSortedProducts(params: SmartSortParams) {
  const { categoryId, offset, limit, brands, subcategories, colors, styles, search } = params
  
  const supabase = await createClient()
  
  // Fetch more products than needed to allow for better algorithmic sorting
  const fetchLimit = limit * 2
  
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
    .eq("category_id", categoryId)
    .eq("products.status", "live")

  // Apply filters
  if (brands && brands.length > 0) {
    query = query.in("products.brand", brands)
  }
  
  if (subcategories && subcategories.length > 0) {
    query = query.in("products.sub_category", subcategories)
  }

  if (colors && colors.length > 0) {
    query = query.in("products.color_filter", colors)
  }

  if (styles && styles.length > 0) {
    query = query.in("products.style_type", styles)
  }

  if (search && search.trim()) {
    const term = search.trim()
    query = query.or(
      `name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`,
      { referencedTable: "products" },
    )
  }

  query = query.range(offset, offset + fetchLimit - 1)

  const { data: productCategories, error: pcError } = await query

  if (pcError) {
    console.error("Error fetching products for smart sort:", pcError)
    return { products: [], error: pcError }
  }

  const productsData =
    productCategories?.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    })) || []

  if (productsData.length === 0) {
    return { products: [], error: null }
  }

  // Get sales data
  const salesData = new Map()
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

  // Get Cloudflare images
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

  // Apply smart discovery sorting algorithm
  const now = new Date()
  
  const productsWithScore = optimizedProducts.map((product: any) => {
    const salesCount = salesData.get(product.id) || 0
    const daysSinceCreated = Math.max(0, (now.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24))
    
    // Recency boost: products less than 14 days old get a boost
    const recencyBoost = daysSinceCreated < 14 ? Math.max(0, (14 - daysSinceCreated) / 14) * 5 : 0
    
    // Sales score: logarithmic to prevent top sellers from dominating
    const salesScore = salesCount > 0 ? Math.log(salesCount + 1) * 3 : 0
    
    // Bestseller badge boost
    const bestsellerBoost = product.is_bestseller ? 2 : 0
    
    // New in badge boost
    const newInBoost = product.is_new_in ? 1 : 0
    
    // Price variety score
    const priceScore = product.price > 50 && product.price < 200 ? 0.5 : 0
    
    // Random element for freshness
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
  
  // Apply diversity mixing
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
  
  while (remaining.length > 0 && diversifiedProducts.length < limit) {
    let bestIndex = 0
    let bestDiversityScore = -1
    
    for (let i = 0; i < Math.min(10, remaining.length); i++) {
      const product = remaining[i]
      let diversityScore = 0
      
      const brandRecency = recentBrands.indexOf(product.brand)
      if (brandRecency === -1) {
        diversityScore += 3
      } else {
        diversityScore -= brandRecency
      }
      
      const categoryRecency = recentCategories.indexOf(product.sub_category || product.category)
      if (categoryRecency === -1) {
        diversityScore += 2
      } else {
        diversityScore -= categoryRecency * 0.5
      }
      
      const priceTier = getPriceTier(product.price)
      const priceTierRecency = recentPriceTiers.indexOf(priceTier)
      if (priceTierRecency === -1) {
        diversityScore += 1
      } else {
        diversityScore -= priceTierRecency * 0.3
      }
      
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
  
  return { products: diversifiedProducts, error: null }
}
