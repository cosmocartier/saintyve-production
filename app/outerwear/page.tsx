import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { OuterwearClient } from "@/components/category-pages/outerwear/outerwear-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { getFilterOptionsForCategory } from "@/app/actions/get-filter-options"

const INITIAL_LOAD_LIMIT = 20
const CATEGORY_NAME = "Outerwear"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }
}): Promise<Metadata> {
  const hasActiveFilters = Boolean(searchParams.brand || searchParams.subcategory || searchParams.color || searchParams.style || searchParams.sort)
  
  return {
    title: "Outerwear | Saint Yve",
    description:
      "Discover premium outerwear at Saint Yve — jackets, coats, blazers, and more from top designer brands.",
    openGraph: {
      title: "Outerwear | Saint Yve",
      description:
        "Discover premium outerwear at Saint Yve — jackets, coats, blazers, and more from top designer brands.",
      type: "website",
      url: "https://designerdrip.com/outerwear",
    },
    twitter: {
      card: "summary_large_image",
      title: "Outerwear | Saint Yve",
      description:
        "Discover premium outerwear at Saint Yve — jackets, coats, blazers, and more from top designer brands.",
    },
    alternates: {
      canonical: "https://designerdrip.com/outerwear",
    },
    robots: {
      index: !hasActiveFilters,
      follow: true,
    },
  }
}

export default async function OuterwearPage({
  searchParams,
}: {
  searchParams: { brand?: string; subcategory?: string; color?: string; style?: string; sort?: string }
}) {
  const supabase = await createClient()

  // Build query with filters - fetch directly from products table where category = 'outerwear'
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
    .eq("category", "outerwear")
    .eq("status", "live")

  // Apply filters from URL params
  if (searchParams.brand) {
    const brands = searchParams.brand.split(',')
    query = query.in("brand", brands)
  }
  
  if (searchParams.subcategory) {
    const subcategories = searchParams.subcategory.split(',')
    query = query.in("sub_category", subcategories)
  }

  if (searchParams.color) {
    const colors = searchParams.color.split(',')
    query = query.in("color_filter", colors)
  }

  if (searchParams.style) {
    const styles = searchParams.style.split(',')
    query = query.in("style_type", styles)
  }

  // Apply sorting
  const sortParam = searchParams.sort || "recommended"
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

  const { data: productsData, error: pcError } = await query

  if (pcError) {
    console.error("Error fetching outerwear:", pcError)
  }

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

  const optimizedProducts =
    productsData?.map((product: any) => ({
      ...product,
      product_images: product.use_cloudflare_images
        ? cfImagesMap.get(product.id) || []
        : product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    })) || []

  // Get total count with same filters applied
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", "outerwear")
    .eq("status", "live")

  if (searchParams.brand) {
    const brands = searchParams.brand.split(',')
    countQuery = countQuery.in("brand", brands)
  }
  
  if (searchParams.subcategory) {
    const subcategories = searchParams.subcategory.split(',')
    countQuery = countQuery.in("sub_category", subcategories)
  }

  if (searchParams.color) {
    const colors = searchParams.color.split(',')
    countQuery = countQuery.in("color_filter", colors)
  }

  if (searchParams.style) {
    const styles = searchParams.style.split(',')
    countQuery = countQuery.in("style_type", styles)
  }

  const { count: totalCount } = await countQuery

  // Fetch all filter options server-side for products with category = 'outerwear'
  const filterOptions = await getFilterOptionsForCategory("outerwear")

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <OuterwearClient
          initialProducts={optimizedProducts}
          totalCount={totalCount || 0}
          initialLimit={INITIAL_LOAD_LIMIT}
          categorySlug="outerwear"
          filterOptions={filterOptions}
          currentFilters={{
            brands: searchParams.brand?.split(',') || [],
            subcategories: searchParams.subcategory?.split(',') || [],
            colors: searchParams.color?.split(',') || [],
            styles: searchParams.style?.split(',') || [],
            sort: searchParams.sort || "recommended",
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
                name: "Outerwear",
                item: "https://designerdrip.store/outerwear",
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
