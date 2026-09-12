"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface ChanelClientProps {
  initialProducts: Product[]
  totalCount: number
  initialLimit: number
}

export function ChanelClient({ initialProducts, totalCount, initialLimit }: ChanelClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    setProducts(initialProducts)
    setCurrentOffset(initialLimit)
  }, [initialProducts, initialLimit])

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("chanelScrollPosition")
      const savedProductCount = sessionStorage.getItem("chanelLoadedCount")

      if (savedProductCount && savedScrollPosition) {
        const targetCount = Number.parseInt(savedProductCount, 10)
        const scrollY = Number.parseInt(savedScrollPosition, 10)

        if (targetCount > initialProducts.length) {
          const supabase = createBrowserClient()

          try {
            const { data: restoredProducts, error } = await supabase
              .from("products")
              .select(`
                *,
                product_variants (
                  id,
                  size,
                  stock_quantity
                ),
                product_images_cf (
                  id,
                  cf_image_id,
                  alt_text,
                  sort_order,
                  role
                )
              `)
              .eq("brand", "Chanel")
              .eq("status", "live")
              .eq("category", "Bag")
              .order("created_at", { ascending: false })
              .range(0, targetCount - 1)

            if (!error && restoredProducts && restoredProducts.length > 0) {
              const optimizedProducts = restoredProducts.map((product: any) => {
                const sortedImages =
                  product.product_images_cf
                    ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                    .slice(0, 2)
                    .map((img: any) => ({
                      id: img.id,
                      url: buildCfUrl(img.cf_image_id, "grid"),
                      alt_text: img.alt_text,
                      display_order: img.sort_order,
                      color_name: img.color_name,
                      color_hex: img.color_hex,
                    })) || []

                return {
                  ...product,
                  product_images: sortedImages,
                  has_multiple_images: sortedImages.length > 1,
                }
              })

              setProducts(optimizedProducts)
              setCurrentOffset(restoredProducts.length)
            }
          } catch (error) {
            console.error("[v0] Error restoring Chanel products:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem("chanelScrollPosition")
        sessionStorage.removeItem("chanelLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("chanelScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("chanelLoadedCount", products.length.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [products.length])

  const hasMore = products.length < totalCount

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      const { data: newProducts, error } = await supabase
        .from("products")
        .select(`
          *,
          product_variants (
            id,
            size,
            stock_quantity
          ),
          product_images_cf (
            id,
            cf_image_id,
            alt_text,
            sort_order,
            role
          )
        `)
        .eq("brand", "Chanel")
        .eq("status", "live")
        .eq("category", "Bag")
        .order("created_at", { ascending: false })
        .range(currentOffset, totalCount - 1)

      if (error) {
        console.error("[v0] Error loading more Chanel products:", error)
        return
      }

      if (newProducts && newProducts.length > 0) {
        const optimizedProducts = newProducts.map((product: any) => {
          const sortedImages =
            product.product_images_cf
              ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
              .slice(0, 2)
              .map((img: any) => ({
                id: img.id,
                url: buildCfUrl(img.cf_image_id, "grid"),
                alt_text: img.alt_text,
                display_order: img.sort_order,
                color_name: img.color_name,
                color_hex: img.color_hex,
              })) || []

          return {
            ...product,
            product_images: sortedImages,
            has_multiple_images: sortedImages.length > 1,
          }
        })

        const existingIds = new Set(products.map((p) => p.id))
        const uniqueNewProducts = optimizedProducts.filter((p) => !existingIds.has(p.id))

        if (uniqueNewProducts.length > 0) {
          setProducts((prev) => [...prev, ...uniqueNewProducts])
          setCurrentOffset((prev) => prev + newProducts.length)
        }
      }
    } catch (error) {
      console.error("[v0] Exception loading more Chanel products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white py-[0]">
        <div className="w-full max-w-[1920px] mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[1px] lg:gap-x-1 gap-y-5 my-2.5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    hidePrice
                    emphasizedTitle
                    preloadSecondImage
                  />
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
    </>
  )
}
