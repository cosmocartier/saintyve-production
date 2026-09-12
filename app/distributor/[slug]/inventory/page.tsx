import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getDistributorSession } from "@/app/actions/distributor-auth"
import { createClient } from "@/lib/supabase/server"
import { InventoryClient, InventorySkeleton } from "@/components/distributor/InventoryClient"
import type { InventoryProduct } from "@/components/distributor/InventoryClient"
import { Suspense } from "react"

// ─── Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Inventory | Distributor Portal | SAINT YVE",
  description: "Live product catalog. Restricted distributor access.",
}

// ─── Data Fetcher ───────────────────────────────────────────────────────────

async function fetchInventory(): Promise<{
  products: InventoryProduct[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Fetch all products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, brand, category, price, status, updated_at, created_at")
      .order("name", { ascending: true })

    if (productsError) {
      console.error("[inventory] Products fetch error:", productsError)
      return { products: [], error: productsError.message }
    }

    if (!products || products.length === 0) {
      return { products: [] }
    }

    // Fetch first images (sort_order = 0) from product_images_cf
    const productIds = products.map((p: { id: string }) => p.id)

    const { data: images, error: imagesError } = await supabase
      .from("product_images_cf")
      .select("product_id, cf_image_id, sort_order")
      .in("product_id", productIds)
      .eq("sort_order", 0)

    if (imagesError) {
      console.error("[inventory] Images fetch error:", imagesError)
      // Non-fatal: continue without images
    }

    // Build image map: product_id → cf_image_id
    const imageMap = new Map<string, string>()
    if (images) {
      for (const img of images) {
        // Only store the first one encountered per product (sort_order = 0)
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.cf_image_id)
        }
      }
    }

    // Merge
    const merged: InventoryProduct[] = products.map(
      (p: {
        id: string
        name: string
        slug: string | null
        brand: string | null
        category: string | null
        price: number | null
        status: string | null
        updated_at: string | null
        created_at: string | null
      }) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category,
        price: p.price,
        status: p.status,
        updated_at: p.updated_at,
        created_at: p.created_at,
        thumbnail_cf_id: imageMap.get(p.id) ?? null,
      }),
    )

    return { products: merged }
  } catch (err) {
    console.error("[inventory] Unexpected error:", err)
    return { products: [], error: "An unexpected error occurred." }
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) notFound()

  // Layout already guards session — secondary read for partnerName
  const session = await getDistributorSession()
  const partnerName =
    session?.company_name ||
    `${session?.first_name ?? ""} ${session?.last_name ?? ""}`.trim() ||
    "Partner"

  const { products, error } = await fetchInventory()

  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryClient
        partnerName={partnerName}
        products={products}
        error={error}
      />
    </Suspense>
  )
}
