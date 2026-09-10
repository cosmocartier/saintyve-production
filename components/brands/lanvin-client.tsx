"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"
import { BrandFilterSortControls } from "@/components/brand-filter-sort-controls"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface LanvinClientProps {
  initialProducts: Product[]
  totalCount: number
  initialLimit: number
  currentCategory: string
  currentSort: string
  availableCategories: string[]
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20

export function LanvinClient({
  initialProducts,
  totalCount,
  initialLimit,
  currentCategory,
  currentSort,
  availableCategories,
}: LanvinClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

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

    return `/brands/lanvin${params.toString() ? `?${params.toString()}` : ""}`
  }

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("lanvinScrollPosition")
      const savedProductCount = sessionStorage.getItem("lanvinLoadedCount")

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
              .eq("brand", "Lanvin")
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
            console.error("[v0] Error restoring Lanvin products:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem("lanvinScrollPosition")
        sessionStorage.removeItem("lanvinLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("lanvinScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("lanvinLoadedCount", products.length.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [products.length])

  const hasMore = products.length < totalCount

  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore || isRestoring) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoading && hasMore) {
          loadMoreProducts()
        }
      },
      {
        root: null,
        rootMargin: "400px",
        threshold: 0,
      },
    )

    observer.observe(loadMoreTriggerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isLoading, currentOffset, isRestoring])

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
        .eq("brand", "Lanvin")
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + batchSize - 1)

      if (error) {
        console.error("[v0] Error loading more Lanvin products:", error)
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
      console.error("[v0] Exception loading more Lanvin products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="w-full max-w-[1920px] mx-auto mb-16">
        <div className="grid lg:grid-cols-2">
          {/* Left Column: Text Panel */}
          <div className="bg-[#000000] px-8 py-12 lg:px-16 lg:py-16 flex flex-col justify-center">
            <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight uppercase mb-6">LANVIN</h1>
            <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-xl">
              Founded in 1889 by Jeanne Lanvin, Lanvin is the oldest French fashion house still in operation. With over a century of Parisian elegance, Lanvin embodies timeless sophistication and refined craftsmanship. From haute couture to contemporary ready-to-wear, each piece celebrates the brand's rich heritage while embracing modern innovation. Discover a legacy of luxury that continues to define French fashion excellence.
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
              {/* Desktop Layout - Always 4-column grid */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-px">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} disableMobileGallery={true} disableHoverEffect={true} />
                ))}
              </div>

              {/* Mobile Layout - 2-column grid */}
              <div className="lg:hidden grid grid-cols-2 gap-px">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} disableMobileGallery={true} />
                ))}
              </div>

              {hasMore && (
                <div ref={loadMoreTriggerRef} className="h-20 flex items-center justify-center">
                  {/* Invisible trigger point for infinite scroll - no visible loading UI */}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
