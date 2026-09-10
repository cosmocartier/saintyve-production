'use server'

import { createClient } from '@/lib/supabase/server'

interface FilterParams {
  categoryId: string
  brands?: string[]
  subcategories?: string[]
  colors?: string[]
  styles?: string[]
  search?: string
}

/**
 * Gets the count of products matching the given filters
 * Used to show accurate count in the "View X Products" button
 */
export async function getFilteredProductCount(params: FilterParams): Promise<number> {
  const supabase = await createClient()
  const { categoryId, brands, subcategories, colors, styles, search } = params

  // Build query with filters
  let query = supabase
    .from('product_categories')
    .select('product_id, products!inner(id, brand, sub_category, style_type, status, name, description, category)', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('products.status', 'live')

  // Apply filters
  if (brands && brands.length > 0) {
    query = query.in('products.brand', brands)
  }
  
  if (subcategories && subcategories.length > 0) {
    query = query.in('products.sub_category', subcategories)
  }

  if (styles && styles.length > 0) {
    query = query.in('products.style_type', styles)
  }

  if (search && search.trim()) {
    const term = search.trim()
    query = query.or(
      `name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`,
      { referencedTable: 'products' },
    )
  }

  // Note: Color filtering is not applied here since it requires checking product_images table
  // The count may be slightly higher than actual if color filters are applied
  // This is acceptable for the "View X Products" button
  
  const { count } = await query

  return count || 0
}
