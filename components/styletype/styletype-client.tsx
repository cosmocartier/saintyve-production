"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { StyleTypeOption } from "@/lib/style-types"

interface StyleTypeClientProps {
  initialProducts: Product[]
  categories: StyleTypeOption[]
  totalCount: number
  initialLimit: number
  currentStyleSlug: string
  currentStyleName: string
}

const LOAD_MORE_BATCH = 20

export function StyleTypeClient({
  initialProducts,
  categories,
  totalCount,
  initialLimit,
  currentStyleSlug,
  currentStyleName,
}: StyleTypeClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)

  const hasMore = products.length < totalCount

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      const isMobile = window.innerWidth < 1024
      const batchSize = isMobile ? LOAD_MORE_BATCH : LOAD_MORE_BATCH

      const { data: moreProducts, error } = await supabase
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
        .eq("style_type", currentStyleName)
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + batchSize - 1)

      if (error) {
        console.error("[v0] Error loading more style type products:", error)
        return
      }

      if (moreProducts && moreProducts.length > 0) {
        const cfProductIds = moreProducts.filter((p: any) => p.use_cloudflare_images).map((p: any) => p.id)
        const cfImagesMap = new Map<string, any[]>()

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

        const optimizedProducts = moreProducts.map((product: any) => {
          const images = product.use_cloudflare_images
            ? cfImagesMap.get(product.id) || []
            : product.product_images || []

          const imagesByColor = new Map<string, any>()

          images
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .forEach((img: any) => {
              const colorKey = img.color_name || "default"
              if (!imagesByColor.has(colorKey)) {
                imagesByColor.set(colorKey, img)
              }
            })

          return {
            ...product,
            product_images: Array.from(imagesByColor.values()),
            has_multiple_images: images.length > imagesByColor.size,
          }
        })

        const existingIds = new Set(products.map((p) => p.id))
        const uniqueNewProducts = optimizedProducts.filter((p: any) => !existingIds.has(p.id))

        if (uniqueNewProducts.length > 0) {
          setProducts((prev) => [...prev, ...uniqueNewProducts])
          setCurrentOffset((prev) => prev + moreProducts.length)
        }
      }
    } catch (error) {
      console.error("[v0] Exception loading more style type products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-7 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-6 text-[#111111] uppercase">
            {currentStyleName}
          </h1>
          <div className="w-full h-[1px] bg-black/10" />
        </div>

        <div className="mb-8 px-4">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {categories.map((styleType) => (
              <Link
                key={styleType.slug}
                href={`/styletype/${styleType.slug}`}
                className={`text-[15px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 ${
                  currentStyleSlug === styleType.slug
                    ? "text-[#444444] border-b border-[#444444]/15"
                    : "text-[#888888] border-b border-transparent hover:text-[#555555]"
                }`}
              >
                {styleType.name.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12 px-4">
                <button
                  onClick={loadMoreProducts}
                  disabled={isLoading}
                  className="group relative px-8 py-4 bg-black text-white uppercase tracking-[0.2em] text-xs font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <span className="font-medium">Load More</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
