import type { ProductVariant } from "@/lib/types/product"

/**
 * Comprehensive size sorting utility that handles:
 * - Shoe sizes (US 7, EU 40, UK 6, etc.)
 * - Clothing sizes (XXS, XS, S, M, L, XL, XXL, XXXL)
 * - Numeric sizes (7, 8, 9, 10, etc.)
 * - Special sizes (One Size, OS, etc.)
 */

// Standard clothing size order
const CLOTHING_SIZE_ORDER = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]

// Special sizes that should appear at the end
const SPECIAL_SIZES = ["ONE SIZE", "OS", "ONE-SIZE", "ONESIZE"]

/**
 * Extract numeric value from size string
 * Examples: "US 7" -> 7, "EU 40" -> 40, "7.5" -> 7.5, "10" -> 10
 */
function extractNumericValue(size: string): number | null {
  // Remove common prefixes and clean the string
  const cleaned = size.replace(/^(US|EU|UK|SIZE)\s*/i, "").trim()

  // Try to parse as number
  const num = Number.parseFloat(cleaned)

  return isNaN(num) ? null : num
}

/**
 * Determine if a size is a special size (One Size, etc.)
 */
function isSpecialSize(size: string): boolean {
  const normalized = size.toUpperCase().replace(/[\s-]/g, "")
  return SPECIAL_SIZES.some((special) => normalized === special.replace(/[\s-]/g, ""))
}

/**
 * Sort product variants by size in ascending order
 */
export function sortSizeVariants(variants: ProductVariant[]): ProductVariant[] {
  return [...variants].sort((a, b) => {
    const sizeA = a.size.trim()
    const sizeB = b.size.trim()

    // Normalize for comparison
    const normalizedA = sizeA.toUpperCase()
    const normalizedB = sizeB.toUpperCase()

    // Handle special sizes - they go to the end
    const isSpecialA = isSpecialSize(sizeA)
    const isSpecialB = isSpecialSize(sizeB)

    if (isSpecialA && !isSpecialB) return 1
    if (!isSpecialA && isSpecialB) return -1
    if (isSpecialA && isSpecialB) return 0

    // Try to extract numeric values (for shoe sizes like "US 7", "EU 40", or plain "7")
    const numA = extractNumericValue(sizeA)
    const numB = extractNumericValue(sizeB)

    // If both are numeric, sort numerically
    if (numA !== null && numB !== null) {
      return numA - numB
    }

    // Check if sizes are in standard clothing size order
    const indexA = CLOTHING_SIZE_ORDER.indexOf(normalizedA)
    const indexB = CLOTHING_SIZE_ORDER.indexOf(normalizedB)

    // If both are standard clothing sizes, sort by order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only one is a standard size, it comes first
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1

    // Fallback to alphabetical sorting
    return normalizedA.localeCompare(normalizedB)
  })
}

/**
 * Sort an array of size strings
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const mockVariants = [{ size: a } as ProductVariant, { size: b } as ProductVariant]
    const sorted = sortSizeVariants(mockVariants)
    return sorted[0].size === a ? -1 : 1
  })
}
