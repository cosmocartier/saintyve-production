import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { BrandCollectionClient } from "@/components/category-pages/brand-collection/brand-collection-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getFilterOptionsForBrand } from "@/app/actions/get-filter-options"
import { optimizeCollectionsProducts } from "@/lib/collections-products"

const INITIAL_LOAD_LIMIT = 20

export type BrandPageSearchParams = {
  subcategory?: string
  color?: string
  style?: string
  sort?: string
}

export function hasActiveBrandFilters(params: BrandPageSearchParams) {
  return Boolean(params.subcategory || params.color || params.style || params.sort)
}

interface BrandCollectionPageProps {
  searchParams: BrandPageSearchParams
  brands: string[]
  category?: string
  brandLabel: string
  pageTitle: string
  basePath: string
  storageKeyPrefix: string
  modelPattern?: string
  breadcrumbs: Array<{ name: string; path: string }>
}

export async function BrandCollectionPage({
  searchParams,
  brands,
  category = "Bag",
  brandLabel,
  pageTitle,
  basePath,
  storageKeyPrefix,
  modelPattern,
  breadcrumbs,
}: BrandCollectionPageProps) {
  const supabase = await createClient()

  const subcategories = searchParams.subcategory?.split(",") || []
  const colors = searchParams.color?.split(",") || []
  const styles = searchParams.style?.split(",") || []
  const sortParam = searchParams.sort || "recommended"

  let query = supabase
    .from("products")
    .select(`
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
      ),
      product_images_cf (
        id,
        cf_image_id,
        alt_text,
        sort_order,
        role,
        category_image
      )
    `)
    .in("brand", brands)
    .eq("category", category)
    .eq("status", "live")

  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("brand", brands)
    .eq("category", category)
    .eq("status", "live")

  if (modelPattern) {
    query = query.filter("model", "imatch", modelPattern)
    countQuery = countQuery.filter("model", "imatch", modelPattern)
  }

  if (subcategories.length > 0) {
    query = query.in("sub_category", subcategories)
    countQuery = countQuery.in("sub_category", subcategories)
  }

  if (colors.length > 0) {
    query = query.in("color_filter", colors)
    countQuery = countQuery.in("color_filter", colors)
  }

  if (styles.length > 0) {
    query = query.in("style_type", styles)
    countQuery = countQuery.in("style_type", styles)
  }

  if (sortParam === "price-low") {
    query = query.order("price", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const [{ data: productsData, error }, { count: totalCount }, filterOptions] = await Promise.all([
    query.limit(INITIAL_LOAD_LIMIT),
    countQuery,
    getFilterOptionsForBrand(brands, category, modelPattern),
  ])

  if (error) {
    console.error(`Error fetching ${pageTitle} products:`, error)
  }

  const optimizedProducts = optimizeCollectionsProducts(productsData || [])

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <BrandCollectionClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          filterOptions={filterOptions}
          currentFilters={{ subcategories, colors, styles, sort: sortParam }}
          brands={brands}
          category={category}
          basePath={basePath}
          pageTitle={pageTitle}
          storageKeyPrefix={storageKeyPrefix}
          brandLabel={brandLabel}
          modelPattern={modelPattern}
        />
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [{ name: "Home", path: "" }, ...breadcrumbs].map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: crumb.name,
              item: `https://designerdrip.store${crumb.path}`,
            })),
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
