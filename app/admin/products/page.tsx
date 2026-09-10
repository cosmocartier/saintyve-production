import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProductsTable from "@/components/admin/management/products/products-table"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"

const ITEMS_PER_PAGE = 20

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const categoryId = searchParams.category
  let categoryInfo = null

  if (categoryId) {
    const { data: category } = await supabase.from("categories").select("*").eq("id", categoryId).single()
    categoryInfo = category
  }

  let query = supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(url, display_order),
      order_items(quantity),
      category:categories(id, name, slug)
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1)

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data: products, error: productsError, count } = await query

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  // Fetch Cloudflare images for products that use them
  const cfProductIds = products?.filter((p) => p.use_cloudflare_images).map((p) => p.id) || []
  let cfImagesMap = new Map()

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
        cfImagesMap.get(img.product_id).push(img)
      })
    }
  }

  const productsWithStats =
    products?.map((product) => {
      const orderCount = product.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
      
      // Get primary image from either source
      let primaryImage = null
      if (product.use_cloudflare_images) {
        const cfImages = cfImagesMap.get(product.id) || []
        const primaryCfImage = cfImages.find((img: any) => img.role === "primary") || cfImages[0]
        if (primaryCfImage) {
          primaryImage = `https://imagedelivery.net/lcn8llMxZeKUFR0YAKOriA/${primaryCfImage.cf_image_id}/public`
        }
      } else {
        primaryImage = product.images?.[0]?.url || null
      }

      return {
        ...product,
        orderCount,
        primaryImage,
        status: product.status || "draft",
      }
    }) || []

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <AdminSidebar userEmail={user.email || ""} />

      <div className="flex-1 p-8">
        <div className="mb-8">
          {categoryInfo && (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-white/30 hover:text-white/60 mb-5 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to All Products
            </Link>
          )}

          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management</p>
              <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">
                {categoryInfo ? `${categoryInfo.name} Products` : "Products"}
              </h1>
              <p className="font-sans text-[10px] tracking-wide text-white/30">
                {categoryInfo ? `Manage products in the ${categoryInfo.name} category` : "Manage your product catalog"}
              </p>
            </div>
            <Link
              href={`/admin/products/new${categoryId ? `?category=${categoryId}` : ""}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all"
            >
              <Plus size={13} />
              New Product
            </Link>
          </div>
        </div>

        <ProductsTable initialProducts={productsWithStats} categoryId={categoryId} totalCount={count || 0} />
      </div>
    </div>
  )
}
