"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface OnWearGalleryProps {
  productId: string
  brand: string | null
}

interface RecommendedTile {
  productId: string
  slug: string
  cf_image_id: string
  alt_text: string | null
}

// Fixed 6-tile editorial mosaic (3 columns x 4 rows) replicating the reference layout:
//   [ 0  0 ][1]        0 = large top-left     (cols 1-2, rows 1-2)
//   [ 0  0 ][2]        1 = top-right, 2 = mid-right
//   [3][ 4  4 ]        3 = mid-left
//   [5][ 4  4 ]        4 = large bottom-right (cols 2-3, rows 3-4), 5 = bottom-left
// Each small tile is a portrait 4:5 cell; the container aspect keeps that ratio.
const TILE_POSITIONS = [
  "col-start-1 row-start-1 col-span-2 row-span-2", // slot 0 - large
  "col-start-3 row-start-1", // slot 1
  "col-start-3 row-start-2", // slot 2
  "col-start-1 row-start-3", // slot 3
  "col-start-2 row-start-3 col-span-2 row-span-2", // slot 4 - large
  "col-start-1 row-start-4", // slot 5
]

export function OnWearGallery({ productId, brand }: OnWearGalleryProps) {
  const [tiles, setTiles] = useState<RecommendedTile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!brand) {
      setIsLoading(false)
      return
    }

    let isActive = true
    setIsLoading(true)

    // The "brand" column stores inconsistent variants for the same brand (e.g. "Hermès" vs "Hermes"),
    // matching the pattern already used by the brand landing pages. Match against both the accented
    // form and its ASCII-normalized equivalent so recommendations aren't dropped by a diacritic mismatch.
    const normalizedBrand = brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const brandVariants = Array.from(new Set([brand, normalizedBrand]))

    const fetchBrandRecommendations = async () => {
      const supabase = createBrowserClient()

      try {
        // Find other live products from the same brand.
        const { data: brandProducts, error: productsError } = await supabase
          .from("products")
          .select("id, slug")
          .in("brand", brandVariants)
          .eq("status", "live")
          .neq("id", productId)
          .order("is_bestseller", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(24)

        if (productsError || !brandProducts || brandProducts.length === 0) {
          if (isActive) setTiles([])
          return
        }

        const candidateIds = brandProducts.map((p) => p.id)

        // Fetch every image for each candidate (both category/brand-designated and standard),
        // same as the brand landing pages, so we can prefer the category image but fall back
        // to the product's primary image when no category image has been set.
        const { data: allImages, error: imagesError } = await supabase
          .from("product_images_cf")
          .select("product_id, cf_image_id, alt_text, sort_order, role, category_image")
          .in("product_id", candidateIds)
          .order("sort_order", { ascending: true })

        if (imagesError || !allImages) {
          if (isActive) setTiles([])
          return
        }

        const imagesByProduct = new Map<string, typeof allImages>()
        for (const image of allImages) {
          const existing = imagesByProduct.get(image.product_id)
          if (existing) {
            existing.push(image)
          } else {
            imagesByProduct.set(image.product_id, [image])
          }
        }

        const firstImageByProduct = new Map<string, { cf_image_id: string; alt_text: string | null }>()
        for (const [productIdKey, images] of imagesByProduct) {
          const categoryImage = images.find((img) => img.category_image)
          const primaryImage = images.find((img) => !img.category_image && img.role === "primary")
          const fallbackImage = images.find((img) => !img.category_image)
          const chosen = categoryImage || primaryImage || fallbackImage
          if (chosen) {
            firstImageByProduct.set(productIdKey, {
              cf_image_id: chosen.cf_image_id,
              alt_text: chosen.alt_text,
            })
          }
        }

        const resolved: RecommendedTile[] = []
        for (const candidate of brandProducts) {
          const image = firstImageByProduct.get(candidate.id)
          if (image) {
            resolved.push({
              productId: candidate.id,
              slug: candidate.slug,
              cf_image_id: image.cf_image_id,
              alt_text: image.alt_text,
            })
          }
          if (resolved.length === 6) break
        }

        if (isActive) setTiles(resolved)
      } catch (error) {
        console.error("[Brand Gallery] Exception fetching recommendations:", error)
        if (isActive) setTiles([])
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchBrandRecommendations()

    return () => {
      isActive = false
    }
  }, [productId, brand])

  if (isLoading || tiles.length === 0) {
    return null
  }

  return (
    <section aria-label="More from this brand" className="w-full bg-white">
      <div className="mx-auto w-full lg:max-w-2xl">
        <div className="grid aspect-[3/5] grid-cols-3 grid-rows-4 gap-0.5">
          {tiles.slice(0, 6).map((tile, index) => (
            <Link
              key={tile.productId}
              href={`/products/${tile.slug}`}
              className={`relative overflow-hidden bg-[#f5f5f5] ${TILE_POSITIONS[index]}`}
            >
              <Image
                src={buildCfUrl(tile.cf_image_id, "pdp") || "/placeholder.svg"}
                alt={tile.alt_text || "Recommended product from this brand"}
                fill
                sizes="(min-width: 1024px) 512px, 100vw"
                className="object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
