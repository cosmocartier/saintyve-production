import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { CollectionsClient } from "@/components/category-pages/collections/collections-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getFilterOptionsForCollections } from "@/app/actions/get-filter-options"
import { COLLECTIONS_BRANDS, COLLECTIONS_GENDER, COLLECTIONS_CATEGORY } from "@/lib/collections-constants"
import { optimizeCollectionsProductImages } from "@/lib/collections-products"

const INITIAL_LOAD_LIMIT = 20

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }>
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const hasActiveFilters = Boolean(
    resolvedSearchParams.brand ||
      resolvedSearchParams.subcategory ||
      resolvedSearchParams.color ||
      resolvedSearchParams.style ||
      resolvedSearchParams.sort,
  )

  return {
    title: "Collections | Saint Yve",
    description:
      "Explore the Saint Yve Collections — curated women's pre-owned bags from Hermès and Chanel, authenticated before they are ever offered.",
    openGraph: {
      title: "Collections | Saint Yve",
      description:
        "Explore the Saint Yve Collections — curated women's pre-owned bags from Hermès and Chanel, authenticated before they are ever offered.",
      type: "website",
      url: "https://designerdrip.com/collections",
    },
    twitter: {
      card: "summary_large_image",
      title: "Collections | Saint Yve",
      description:
        "Explore the Saint Yve Collections — curated women's pre-owned bags from Hermès and Chanel, authenticated before they are ever offered.",
    },
    alternates: {
      canonical: "https://designerdrip.com/collections",
    },
    robots: {
      index: !hasActiveFilters,
      follow: true,
    },
  }
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

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
    .in("brand", COLLECTIONS_BRANDS)
    .eq("gender", COLLECTIONS_GENDER)
    .eq("category", COLLECTIONS_CATEGORY)
    .eq("status", "live")

  // Apply filters from URL params
  if (resolvedSearchParams.brand) {
    query = query.in("brand", resolvedSearchParams.brand.split(","))
  }

  if (resolvedSearchParams.subcategory) {
    query = query.in("sub_category", resolvedSearchParams.subcategory.split(","))
  }

  if (resolvedSearchParams.color) {
    query = query.in("color_filter", resolvedSearchParams.color.split(","))
  }

  if (resolvedSearchParams.style) {
    query = query.in("style_type", resolvedSearchParams.style.split(","))
  }

  // Apply sorting
  const sortParam = resolvedSearchParams.sort || "recommended"
  if (sortParam === "newest") {
    query = query.order("created_at", { ascending: false })
  } else if (sortParam === "price-low") {
    query = query.order("price", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("price", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  query = query.limit(INITIAL_LOAD_LIMIT)

  const { data: productsData, error } = await query

  if (error) {
    console.error("Error fetching collections products:", error)
  }

  const optimizedProducts = (productsData || []).map((product: any) => optimizeCollectionsProductImages(product))

  // Get total count with same filters applied
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("brand", COLLECTIONS_BRANDS)
    .eq("gender", COLLECTIONS_GENDER)
    .eq("category", COLLECTIONS_CATEGORY)
    .eq("status", "live")

  if (resolvedSearchParams.brand) {
    countQuery = countQuery.in("brand", resolvedSearchParams.brand.split(","))
  }

  if (resolvedSearchParams.subcategory) {
    countQuery = countQuery.in("sub_category", resolvedSearchParams.subcategory.split(","))
  }

  if (resolvedSearchParams.color) {
    countQuery = countQuery.in("color_filter", resolvedSearchParams.color.split(","))
  }

  if (resolvedSearchParams.style) {
    countQuery = countQuery.in("style_type", resolvedSearchParams.style.split(","))
  }

  const { count: totalCount } = await countQuery

  // Fetch all filter options server-side for the entire collections set
  const filterOptions = await getFilterOptionsForCollections()

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <CollectionsClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          filterOptions={filterOptions}
          currentFilters={{
            brands: resolvedSearchParams.brand?.split(",") || [],
            subcategories: resolvedSearchParams.subcategory?.split(",") || [],
            colors: resolvedSearchParams.color?.split(",") || [],
            styles: resolvedSearchParams.style?.split(",") || [],
            sort: resolvedSearchParams.sort || "recommended",
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
                name: "Collections",
                item: "https://designerdrip.store/collections",
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
