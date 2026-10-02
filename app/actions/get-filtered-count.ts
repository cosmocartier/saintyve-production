'use server'

import { createClient } from '@/lib/supabase/server'
import { COLLECTIONS_BRANDS, COLLECTIONS_GENDER, COLLECTIONS_CATEGORY } from '@/lib/collections-constants'

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

interface CollectionsFilterParams {
  brands?: string[]
  subcategories?: string[]
  colors?: string[]
  styles?: string[]
}

/**
 * Gets the count of /collections products matching the given filters.
 * Mirrors getFilteredProductCount, but scoped by brand + gender directly on
 * the products table instead of a category junction table.
 */
export async function getFilteredCollectionsCount(params: CollectionsFilterParams): Promise<number> {
  const supabase = await createClient()
  const { brands, subcategories, styles } = params

  let query = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .in('brand', COLLECTIONS_BRANDS)
    .eq('gender', COLLECTIONS_GENDER)
    .eq('category', COLLECTIONS_CATEGORY)
    .eq('status', 'live')

  if (brands && brands.length > 0) {
    query = query.in('brand', brands)
  }

  if (subcategories && subcategories.length > 0) {
    query = query.in('sub_category', subcategories)
  }

  if (styles && styles.length > 0) {
    query = query.in('style_type', styles)
  }

  // Note: Color filtering is not applied here since it requires checking product_images table.
  const { count } = await query

  return count || 0
}

interface BrandFilterParams {
  brands: string[]
  category?: string
  subcategories?: string[]
  colors?: string[]
  styles?: string[]
  /** Case-insensitive POSIX regex matched against `model`, used by model sub-pages. */
  modelPattern?: string
}

/**
 * Gets the count of products matching the given filters for a single-brand
 * product listing page (e.g. /brands/chanel, /brands/hermes). Mirrors
 * getFilteredCollectionsCount, scoped to the given brand(s) instead of the
 * fixed collections brand set.
 */
export async function getFilteredBrandCount(params: BrandFilterParams): Promise<number> {
  const supabase = await createClient()
  const { brands, category = 'Bag', subcategories, styles, modelPattern } = params

  let query = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .in('brand', brands)
    .eq('category', category)
    .eq('status', 'live')

  if (modelPattern) {
    query = query.filter('model', 'imatch', modelPattern)
  }

  if (subcategories && subcategories.length > 0) {
    query = query.in('sub_category', subcategories)
  }

  if (styles && styles.length > 0) {
    query = query.in('style_type', styles)
  }

  // Note: Color filtering is not applied here since it requires checking product_images table.
  const { count } = await query

  return count || 0
}
