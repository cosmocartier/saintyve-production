'use server'

import { createClient } from '@/lib/supabase/server'
import { COLLECTIONS_BRANDS, COLLECTIONS_GENDER } from '@/lib/collections-constants'

export interface FilterOptions {
  subcategories: string[]
  brands: string[]
  colors: string[]
  styleTypes: string[]
}

/**
 * Fetches all available filter options for products in a specific category
 * This runs server-side and fetches ALL products to get complete filter options,
 * regardless of how many products are loaded on the client
 */
export async function getFilterOptionsForCategory(categorySlug: string): Promise<FilterOptions> {
  const supabase = await createClient()

  console.log("[v0] getFilterOptionsForCategory called with categorySlug:", categorySlug)

  // First, get the category ID from the slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) {
    console.log("[v0] Category not found for slug:", categorySlug)
    return {
      subcategories: [],
      brands: [],
      colors: [],
      styleTypes: [],
    }
  }

  console.log("[v0] Found category ID:", category.id)

  // Get all products in this category via the product_categories junction table
  const { data: productCategories, error } = await supabase
    .from('product_categories')
    .select(`
      products!inner (
        id,
        brand,
        sub_category,
        style_type,
        color_filter,
        status
      )
    `)
    .eq('category_id', category.id)
    .eq('products.status', 'live')

  const products = productCategories?.map((pc: any) => pc.products) || []

  console.log("[v0] Products query result:", { 
    productsCount: products?.length || 0,
    error,
    sampleProduct: products?.[0] 
  })

  if (!products || products.length === 0) {
    return {
      subcategories: [],
      brands: [],
      colors: [],
      styleTypes: [],
    }
  }

  const productIds = products.map((p: any) => p.id)

  // Extract unique values for filters
  const subcategoriesSet = new Set<string>()
  const brandsSet = new Set<string>()
  const styleTypesSet = new Set<string>()

  products.forEach((product: any) => {
    if (product.sub_category) {
      subcategoriesSet.add(product.sub_category)
    }
    if (product.brand) {
      brandsSet.add(product.brand)
    }
    if (product.style_type) {
      styleTypesSet.add(product.style_type)
    }
  })

  // Get colors from products table (color_filter field)
  const colorsSet = new Set<string>()
  
  products.forEach((product: any) => {
    if (product.color_filter) {
      colorsSet.add(product.color_filter)
    }
  })

  // Return sorted arrays
  return {
    subcategories: Array.from(subcategoriesSet).sort(),
    brands: Array.from(brandsSet).sort(),
    colors: Array.from(colorsSet).sort(),
    styleTypes: Array.from(styleTypesSet).sort(),
  }
}

/**
 * Fetches all available filter options for the /collections page.
 * Unlike getFilterOptionsForCategory, this isn't scoped to a category via the
 * product_categories junction table — it queries the products table directly
 * for the brand + gender set that defines the collections page.
 */
export async function getFilterOptionsForCollections(): Promise<FilterOptions> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, brand, sub_category, style_type, color_filter, status')
    .in('brand', COLLECTIONS_BRANDS)
    .eq('gender', COLLECTIONS_GENDER)
    .eq('status', 'live')

  if (error) {
    console.error("[v0] Error fetching collections filter options:", error)
  }

  if (!products || products.length === 0) {
    return {
      subcategories: [],
      brands: [],
      colors: [],
      styleTypes: [],
    }
  }

  const subcategoriesSet = new Set<string>()
  const brandsSet = new Set<string>()
  const styleTypesSet = new Set<string>()
  const colorsSet = new Set<string>()

  products.forEach((product: any) => {
    if (product.sub_category) subcategoriesSet.add(product.sub_category)
    if (product.brand) brandsSet.add(product.brand)
    if (product.style_type) styleTypesSet.add(product.style_type)
    if (product.color_filter) colorsSet.add(product.color_filter)
  })

  return {
    subcategories: Array.from(subcategoriesSet).sort(),
    brands: Array.from(brandsSet).sort(),
    colors: Array.from(colorsSet).sort(),
    styleTypes: Array.from(styleTypesSet).sort(),
  }
}
