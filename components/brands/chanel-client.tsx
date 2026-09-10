"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"
import { BrandFilterSortControls } from "@/components/brand-filter-sort-controls"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface ChanelClientProps {
  initialProducts: Product[]
  totalCount: number
  initialLimit: number
  currentCategory: string
  currentSort: string
  availableCategories: string[]
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20

export function ChanelClient({
  initialProducts,
  totalCount,
  initialLimit,
  currentCategory,
  currentSort,
  availableCategories,
}: ChanelClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setProducts(initialProducts)
    setCurrentOffset(initialLimit)
  }, [initialProducts, initialLimit])

  const buildFilterUrl = (type: "category" | "sort", value: string) => {
    const params = new URLSearchParams()

    if (type === "category") {
      if (value) params.set("category", value)
      if (currentSort !== "newest") params.set("sort", currentSort)
    } else if (type === "sort") {
      if (currentCategory) params.set("category", currentCategory)
      if (value && value !== "newest") params.set("sort", value)
    }

    return `/brands/chanel${params.toString() ? `?${params.toString()}` : ""}`
  }

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
              .order("created_at", { ascending: false })
              .range(0, targetCount - 1)

            if (!error && restoredProducts && restoredProducts.length > 0) {
              const optimizedProducts = restoredProducts.map((product: any) => {
                const sortedImages = product.product_images_cf
                  ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
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

      const isMobile = window.innerWidth < 1024
      const batchSize = isMobile ? LOAD_MORE_MOBILE : LOAD_MORE_DESKTOP

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
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + batchSize - 1)

      if (error) {
        console.error("[v0] Error loading more Chanel products:", error)
        return
      }

      if (newProducts && newProducts.length > 0) {
        const optimizedProducts = newProducts.map((product: any) => {
          const sortedImages = product.product_images_cf
            ?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
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
      <section className="w-full max-w-[1920px] mx-auto mb-16">
        <div className="grid lg:grid-cols-2">
          {/* Left Column: Text Panel */}
          <div className="bg-[#2B2B2B] px-8 py-12 lg:px-16 lg:py-16 flex flex-col justify-center">
            <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight uppercase mb-6">CHANEL</h1>
            <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-xl">
              Founded by Gabrielle "Coco" Chanel in 1910, the house of Chanel epitomizes timeless elegance and French
              sophistication. Renowned for iconic pieces like the Chanel No. 5 perfume, the quilted handbag with chain
              strap, and the little black dress, Chanel continues to set the standard for luxury fashion. Discover
              exquisite craftsmanship and enduring style that transcends trends.
            </p>
          </div>

          {/* Right Column: Image Panel */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px] bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-sm uppercase tracking-widest">Image Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1920px] mx-auto">
        <BrandFilterSortControls
          categories={availableCategories}
          currentCategory={currentCategory}
          categoryDropdownOpen={categoryDropdownOpen}
          setCategoryDropdownOpen={setCategoryDropdownOpen}
          categoryRef={categoryRef}
          currentSort={currentSort}
          sortDropdownOpen={sortDropdownOpen}
          setSortDropdownOpen={setSortDropdownOpen}
          sortRef={sortRef}
          buildFilterUrl={buildFilterUrl}
          totalCount={totalCount}
        />
      </div>

      <div className="bg-white py-[0]">
        <div className="w-full max-w-[1920px] mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5 my-2.5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} disableMobileGallery={true} />
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
