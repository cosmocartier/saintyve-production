/**
 * Shared list of style types, matching the `style_type` column values on
 * `products` (see the admin "Style Type" dropdown). Each entry maps the
 * exact DB value to the URL slug used under /styletype/[slug].
 *
 * Only /styletype/streetwear exists today. The rest are listed here so the
 * top selector on that page already shows every style type; new pages can
 * be added under app/styletype/<slug>/ later without touching this list.
 */
export interface StyleTypeOption {
  /** Exact value stored in products.style_type */
  name: string
  /** URL slug used for /styletype/[slug] */
  slug: string
}

export const STYLE_TYPES: StyleTypeOption[] = [
  { name: "Streetwear", slug: "streetwear" },
  { name: "Luxury", slug: "luxury" },
  { name: "Street-Luxury", slug: "street-luxury" },
  { name: "Contemporary", slug: "contemporary" },
  { name: "Minimal", slug: "minimal" },
  { name: "Sport-Inspired", slug: "sport-inspired" },
  { name: "Classic", slug: "classic" },
  { name: "Statement", slug: "statement" },
]
