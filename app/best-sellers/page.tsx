import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StaticNavigation } from "@/components/static-navigation"
import { BestSellersClient } from "@/components/category-pages/best-sellers/best-sellers-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

const ITEMS_PER_PAGE = 24

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { brand?: string; sort?: string; page?: string }
}): Promise<Metadata> {
  const page = Number.parseInt(searchParams.page || "1", 10)
  const hasActiveFilters = Boolean(searchParams.brand || searchParams.sort || page > 1)

  return {
    title: "Best Sellers | Saint Yve",
    description:
      "Shop the most popular items at Saint Yve — our best-selling sneakers, bags, jackets, watches, jewelry and accessories loved by our community.",
    openGraph: {
      title: "Best Sellers | Saint Yve",
      description:
        "Shop the most popular items at Saint Yve — our best-selling sneakers, bags, jackets, watches, jewelry and accessories loved by our community.",
      type: "website",
      url: "https://designerdrip.com/best-sellers",
    },
    twitter: {
      card: "summary_large_image",
      title: "Best Sellers | Saint Yve",
      description:
        "Shop the most popular items at Saint Yve — our best-selling sneakers, bags, jackets, watches, jewelry and accessories loved by our community.",
    },
    alternates: {
      canonical: "https://designerdrip.com/best-sellers",
    },
    robots: {
      index: !hasActiveFilters,
      follow: true,
    },
  }
}

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: { brand?: string; sort?: string; page?: string }
}) {
  const supabase = await createClient()

  // Find Best Sellers category
  const { data: bestSellersCategory } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", "best-sellers")
    .single()

  if (!bestSellersCategory) {
    console.error("Best Sellers category not found")
    return <div>Error: Best Sellers category not configured</div>
  }

  // Get all available brands for best sellers (from product names)
  const { data: productCategories } = await supabase
    .from("product_categories")
    .select(`
      products!inner (
        name
      )
    `)
    .eq("category_id", bestSellersCategory.id)
    .eq("products.status", "live")

  // Extract unique brands from product names (first word typically)
  const brandsSet = new Set<string>()
  productCategories?.forEach((pc: any) => {
    const firstWord = pc.products.name.split(" ")[0]
    if (firstWord) brandsSet.add(firstWord)
  })
  const brands = Array.from(brandsSet).sort()

  // Build query based on filters
  let query = supabase
    .from("product_categories")
    .select(
      `
      product_id,
      sort_order,
      products!inner (
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
      )
    `,
      { count: "exact" },
    )
    .eq("category_id", bestSellersCategory.id)
    .eq("products.status", "live")

  // Apply brand filter if present
  if (searchParams.brand) {
    query = query.ilike("products.name", `${searchParams.brand}%`)
  }

  // Apply sorting - default to newest first for Best Sellers
  const sortParam = searchParams.sort || "newest"
  if (sortParam === "price-low") {
    query = query.order("products(price)", { ascending: true })
  } else if (sortParam === "price-high") {
    query = query.order("products(price)", { ascending: false })
  } else {
    // Sort by newest first (created_at desc)
    query = query.order("products(created_at)", { ascending: false })
  }

  const page = Number.parseInt(searchParams.page || "1", 10)
  const offset = (page - 1) * ITEMS_PER_PAGE

  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data: productCategories2, error: pcError, count: totalCount } = await query

  if (pcError) {
    console.error("Error fetching best sellers:", pcError)
  }

  const productsData =
    productCategories2?.map((pc: any) => ({
      ...pc.products,
      sort_order: pc.sort_order,
    })) || []

  // Handle Cloudflare images for products that use them
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

  const hasActiveFilters = Boolean(searchParams.brand || searchParams.sort || page > 1)

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <BestSellersClient
          products={optimizedProducts}
          totalCount={totalCount || 0}
          brands={brands}
          currentPage={page}
          currentBrand={searchParams.brand || ""}
          currentSort={searchParams.sort || "newest"}
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
                item: "https://designerdrip.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Best Sellers",
                item: "https://designerdrip.com/best-sellers",
              },
            ],
          }),
        }}
      />

      {!hasActiveFilters && (
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
      )}
    </div>
  )
}
