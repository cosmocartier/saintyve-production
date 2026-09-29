import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { CollectionsClient } from "@/components/category-pages/collections/collections-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { getFilterOptionsForCollections } from "@/app/actions/get-filter-options"
import { COLLECTIONS_BRANDS, COLLECTIONS_GENDER } from "@/lib/collections-constants"

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
      "Explore the Saint Yve Collections — curated women's pre-owned pieces from Hermès, Chanel and Maison Margiela.",
    openGraph: {
      title: "Collections | Saint Yve",
      description:
        "Explore the Saint Yve Collections — curated women's pre-owned pieces from Hermès, Chanel and Maison Margiela.",
      type: "website",
      url: "https://designerdrip.com/collections",
    },
    twitter: {
      card: "summary_large_image",
      title: "Collections | Saint Yve",
      description:
        "Explore the Saint Yve Collections — curated women's pre-owned pieces from Hermès, Chanel and Maison Margiela.",
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
      )
    `)
    .in("brand", COLLECTIONS_BRANDS)
    .eq("gender", COLLECTIONS_GENDER)
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

  const productsUsingCf = (productsData || []).filter((p: any) => p.use_cloudflare_images)
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

  const optimizedProducts =
    (productsData || []).map((product: any) => ({
      ...product,
      product_images: product.use_cloudflare_images
        ? cfImagesMap.get(product.id) || []
        : product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    })) || []

  // Get total count with same filters applied
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("brand", COLLECTIONS_BRANDS)
    .eq("gender", COLLECTIONS_GENDER)
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
