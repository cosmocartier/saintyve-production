/**
 * Generate a URL-friendly slug from brand, model, and color
 * @param brand - Product brand
 * @param model - Product model
 * @param color - Product color
 * @returns Formatted slug
 */
export function generateProductSlug(brand: string, model: string, color: string): string {
  const combined = `${brand} ${model} ${color}`

  return (
    combined
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with dashes
      .replace(/[\s_]+/g, "-")
      // Handle numbers: convert "2.0" to "2-0"
      .replace(/\.(\d)/g, "-$1")
      // Remove all punctuation and special characters except dashes and numbers
      .replace(/[^\w\d-]+/g, "")
      // Collapse multiple dashes into one
      .replace(/-+/g, "-")
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, "")
  )
}

/**
 * Ensure slug is unique by appending -2, -3, etc. if needed
 * @param supabase - Supabase client
 * @param baseSlug - The base slug to check
 * @param currentProductId - Optional: exclude this product ID from uniqueness check (for updates)
 * @returns Unique slug
 */
export async function ensureUniqueSlug(supabase: any, baseSlug: string, currentProductId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 2

  while (true) {
    const query = supabase.from("products").select("id").eq("slug", slug)

    // If updating existing product, exclude current product from check
    if (currentProductId) {
      query.neq("id", currentProductId)
    }

    const { data, error } = await query.single()

    // If no match found or error (which means no match), slug is unique
    if (error || !data) {
      return slug
    }

    // Slug exists, try next number
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

/**
 * Generate full display title from brand, model, and color
 * @param brand - Product brand
 * @param model - Product model
 * @param color - Product color
 * @returns Full display title
 */
export function generateDisplayTitle(brand: string, model: string, color: string): string {
  return `${brand} ${model} ${color}`.trim()
}
