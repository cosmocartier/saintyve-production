"use client"

import { useEffect, useState, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ProductCard } from "@/components/products/product-card"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { Product, ProductImage, ProductVariant } from "@/lib/types/product"

interface ProductRecommendationsProps {
  currentProductId: string
  brand: string | null
}

export function ProductRecommendations({ currentProductId, brand }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!brand) {
      setIsLoading(false)
      return
    }

    const fetchRecommendations = async () => {
      const supabase = createBrowserClient()

      try {
        console.log("[v0] Fetching brand recommendations for:", { currentProductId, brand })

        // Best-selling products from the same brand, excluding the current product
        const { data: productsData, error } = await supabase
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
          .eq("status", "live")
          .eq("brand", brand)
          .neq("id", currentProductId)
          .order("is_bestseller", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(8)

        if (error) {
          console.error("[v0] Error fetching brand recommendations:", error)
          setIsLoading(false)
          return
        }

        console.log("[v0] Fetched products:", productsData?.length)

        if (productsData && productsData.length > 0) {
          // Process products with Cloudflare images if needed
          const productsWithCf = productsData.filter((p: any) => p.use_cloudflare_images)
          const cfProductIds = productsWithCf.map((p: any) => p.id)

          console.log("[v0] Products using Cloudflare:", cfProductIds.length)

          const cfImagesMap = new Map<string, any[]>()

          if (cfProductIds.length > 0) {
            const { data: cfImages } = await supabase
              .from("product_images_cf")
              .select("*")
              .in("product_id", cfProductIds)
              .order("sort_order", { ascending: true })

            console.log("[v0] Cloudflare images fetched:", cfImages?.length)

            if (cfImages) {
              cfImages.forEach((img: any) => {
                if (!cfImagesMap.has(img.product_id)) {
                  cfImagesMap.set(img.product_id, [])
                }
                cfImagesMap.get(img.product_id)!.push({
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

          // Optimize products with proper images
          const optimizedProducts = productsData.map((product: any) => ({
            ...product,
            product_images: product.use_cloudflare_images
              ? cfImagesMap.get(product.id) || []
              : product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
          }))

          console.log("[v0] Optimized products:", optimizedProducts.length)
          setRecommendations(optimizedProducts)
        }
      } catch (error) {
        console.error("[v0] Exception fetching brand recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentProductId, brand])

  if (isLoading || recommendations.length === 0 || !brand) {
    return null
  }

  return (
    <div id="you-may-also-like" className="w-full overflow-hidden">
      <div className="lg:px-8 py-0 px-2.5">
        <h2 className="text-2xl lg:text-3xl font-light mb-8 text-[#111111] tracking-tight mt-12">
          More of {brand}
        </h2>
      </div>

      {/* Desktop: 4 columns with horizontal scroll, 1px gap matching landing page category previews */}
      <div className="hidden lg:block">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex gap-px">
            {recommendations.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: "calc(25% - 0.75px)" }}>
                <ProductCard product={product} disableMobileGallery={true} disableHoverEffect={true} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: 2 columns with horizontal scroll, 1px gap matching landing page category previews */}
      <div className="lg:hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex gap-px">
            {recommendations.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: "calc(50% - 0.5px)" }}>
                <ProductCard product={product} disableMobileGallery={true} disableHoverEffect={true} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
