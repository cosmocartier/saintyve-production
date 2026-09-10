import type { Metadata } from "next"
import { requireDistributor } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "DESIGNERDRIP® | Official Distribution Program - Products",
}
import { createClient } from "@/lib/supabase/server"
import { DistributorSidebar } from "@/components/admin/distributor-sidebar"
import { DistributorProductsTable } from "@/components/admin/distributor-products-table"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

export const dynamic = "force-dynamic"

export default async function DistributorProductsPage() {
  const { user, supabase, profile } = await requireDistributor()

  // Fetch all products at once (no pagination)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      use_cloudflare_images,
      images:product_images(url, display_order)
    `,
    )
    .eq("status", "live")
    .order("name", { ascending: true })

  if (productsError) {
    console.error("[v0] Error fetching products:", productsError)
  }

  // Fetch Cloudflare images for ALL live products — regardless of the use_cloudflare_images flag.
  // Some products have images in product_images_cf even though the flag was never set to true,
  // so we always prefer CF images and only fall back to the legacy product_images table when none exist.
  const allProductIds = products?.map((p) => p.id) || []
  const cfImagesMap = new Map<string, any[]>()

  if (allProductIds.length > 0) {
    const { data: cfImages } = await supabase
      .from("product_images_cf")
      .select("product_id, cf_image_id, sort_order, role")
      .in("product_id", allProductIds)
      .order("sort_order", { ascending: true, nullsFirst: false })

    if (cfImages) {
      cfImages.forEach((img: any) => {
        if (!cfImagesMap.has(img.product_id)) {
          cfImagesMap.set(img.product_id, [])
        }
        cfImagesMap.get(img.product_id)!.push(img)
      })
    }
  }

  const productsWithImages =
    products?.map((product) => {
      let primaryImage: string | null = null

      // Always check CF images first — they take priority over the flag value
      const cfProductImages = cfImagesMap.get(product.id) || []
      if (cfProductImages.length > 0) {
        const primaryCfImage = cfProductImages.find((img) => img.role === "primary") || cfProductImages[0]
        if (primaryCfImage) {
          primaryImage = buildCfUrl(primaryCfImage.cf_image_id, "grid")
        }
      } else {
        // Fall back to legacy product_images only when no CF images exist
        const sorted = [...(product.images || [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        primaryImage = sorted[0]?.url || null
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        primaryImage,
      }
    }) || []

  return (
    <div className="flex min-h-screen bg-white">
      <DistributorSidebar userRole={profile.role} userEmail={user.email || ""} />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">PRODUCTS</h1>
          <p className="text-sm text-zinc-500 tracking-wide">Browse the product catalog</p>
        </div>

        <DistributorProductsTable products={productsWithImages} />
      </div>
    </div>
  )
}
