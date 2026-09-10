"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"
import { BrandFilterSortControls } from "@/components/brand-filter-sort-controls"

interface NikeNoctaClientProps {
  initialProducts: Product[]
  categoryId: string
  totalCount: number
  initialLimit: number
  currentCategory: string
  currentSort: string
  availableCategories: string[]
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20

export function NikeNoctaClient({
  initialProducts,
  categoryId,
  totalCount,
  initialLimit,
  currentCategory,
  currentSort,
  availableCategories,
}: NikeNoctaClientProps) {
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

    return `/brands/nike-nocta${params.toString() ? `?${params.toString()}` : ""}`
  }

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("nikeNoctaScrollPosition")
      const savedProductCount = sessionStorage.getItem("nikeNoctaLoadedCount")

      if (savedProductCount && savedScrollPosition) {
        const targetCount = Number.parseInt(savedProductCount, 10)
        const scrollY = Number.parseInt(savedScrollPosition, 10)

        if (targetCount > initialProducts.length) {
          const supabase = createBrowserClient()

          try {
            const { data: productCategories, error } = await supabase
              .from("product_categories")
              .select(`
                product_id,
                sort_order,
                products!inner (
                  *,
                  product_variants (
                    id,
                    size,
                    stock_quantity
                  ),
                  product_images!inner (
                    id,
                    url,
                    alt_text,
                    display_order,
                    color_name,
                    color_hex
                  )
                )
              `)
              .eq("category_id", categoryId)
              .eq("products.status", "live")
              .order("sort_order", { ascending: true })
              .range(0, targetCount - 1)

            if (!error && productCategories && productCategories.length > 0) {
              const restoredProducts = productCategories.map((pc: any) => ({
                ...pc.products,
                sort_order: pc.sort_order,
              }))

              const optimizedProducts = restoredProducts.map((product: any) => {
                const imagesByColor = new Map<string, any>()

                product.product_images
                  ?.sort((a: any, b: any) => a.display_order - b.display_order)
                  .forEach((img: any) => {
                    const colorKey = img.color_name || "default"
                    if (!imagesByColor.has(colorKey)) {
                      imagesByColor.set(colorKey, img)
                    }
                  })

                return {
                  ...product,
                  product_images: Array.from(imagesByColor.values()),
                  has_multiple_images: (product.product_images?.length || 0) > imagesByColor.size,
                }
              })

              setProducts(optimizedProducts)
              setCurrentOffset(productCategories.length)
            }
          } catch (error) {
            console.error("[v0] Error restoring Nike Nocta products:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem("nikeNoctaScrollPosition")
        sessionStorage.removeItem("nikeNoctaLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length, categoryId])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("nikeNoctaScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("nikeNoctaLoadedCount", products.length.toString())
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

      const { data: productCategories, error } = await supabase
        .from("product_categories")
        .select(`
          product_id,
          sort_order,
          products!inner (
            *,
            product_variants (
              id,
              size,
              stock_quantity
            ),
            product_images!inner (
              id,
              url,
              alt_text,
              display_order,
              color_name,
              color_hex
            )
          )
        `)
        .eq("category_id", categoryId)
        .eq("products.status", "live")
        .order("sort_order", { ascending: true })
        .range(currentOffset, currentOffset + batchSize - 1)

      if (error) {
        console.error("[v0] Error loading more Nike Nocta products:", error)
        return
      }

      if (productCategories && productCategories.length > 0) {
        const newProductsData = productCategories.map((pc: any) => ({
          ...pc.products,
          sort_order: pc.sort_order,
        }))

        const optimizedProducts = newProductsData.map((product: any) => {
          const imagesByColor = new Map<string, any>()

          product.product_images
            ?.sort((a: any, b: any) => a.display_order - b.display_order)
            .forEach((img: any) => {
              const colorKey = img.color_name || "default"
              if (!imagesByColor.has(colorKey)) {
                imagesByColor.set(colorKey, img)
              }
            })

          return {
            ...product,
            product_images: Array.from(imagesByColor.values()),
            has_multiple_images: (product.product_images?.length || 0) > imagesByColor.size,
          }
        })

        const existingIds = new Set(products.map((p) => p.id))
        const uniqueNewProducts = optimizedProducts.filter((p) => !existingIds.has(p.id))

        if (uniqueNewProducts.length > 0) {
          setProducts((prev) => [...prev, ...uniqueNewProducts])
          setCurrentOffset((prev) => prev + productCategories.length)
        }
      }
    } catch (error) {
      console.error("[v0] Exception loading more Nike Nocta products:", error)
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
            <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight uppercase mb-6">NIKE NOCTA</h1>
            <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-xl">
              Nike Nocta, the fusion of Nike and Drake, tells a captivating story. Inspired by Drake's late-night
              creative sessions, the collection reflects the energy of the urban night. Each piece, characterised by the
              artist's personal style, is a tribute to creative processes and the courage to push boundaries, embodying
              passion, authenticity and the pursuit of excellence.
            </p>
          </div>

          {/* Right Column: Image Panel */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
            <Image
              src="/images/nike-nocta.webp"
              alt="Nike Nocta collection featuring premium jacket with Nocta logo patch"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
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
