"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { FilterSort } from "@/components/category-pages/filter-sort"
import { GridView } from "@/components/category-pages/grid-view"
import type { FilterOptions } from "@/app/actions/get-filter-options"
import { getFilteredBrandCount } from "@/app/actions/get-filtered-count"
import { optimizeCollectionsProducts } from "@/lib/collections-products"

// Mirrors CollectionsProduct in collections-client.tsx — extends the base
// Product type with the joined/derived fields ProductCard expects.
type BrandProduct = Product & {
  product_variants?: Array<{
    id: string
    size: string
    stock_quantity: number
    color_name?: string | null
    color_hex?: string | null
  }>
  product_images?: Array<{
    id: string
    url: string
    alt_text: string | null
    display_order: number
    color_name?: string | null
    color_hex?: string | null
  }>
  has_multiple_images?: boolean
  colorVariantCount?: number
}

interface BrandCollectionClientProps {
  initialProducts: BrandProduct[]
  totalCount: number
  initialLimit: number
  filterOptions: FilterOptions
  currentFilters: {
    subcategories: string[]
    colors: string[]
    styles: string[]
    sort: string
  }
  /** Brand value(s) to match in the `brand` column, e.g. ["Chanel"] or ["Hermès", "Hermes"]. */
  brands: string[]
  /** Product category to scope this listing to. Defaults to "Bag". */
  category?: string
  /** Base path used to build filter URLs, e.g. "/brands/chanel". */
  basePath: string
  /** Heading shown at the top of the page, e.g. "Chanel". */
  pageTitle: string
  /** Prefix used for sessionStorage scroll-restoration keys, kept unique per brand page. */
  storageKeyPrefix: string
  /** Brand name used in the subheader copy, e.g. "Chanel" or "Hermès". */
  brandLabel: string
  /** Case-insensitive POSIX regex matched against `model`, used by model sub-pages. */
  modelPattern?: string
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20

type GridViewMode = "product" | "catalog" | "compact"

export function BrandCollectionClient({
  initialProducts,
  totalCount,
  initialLimit,
  filterOptions,
  currentFilters,
  brands,
  category = "Bag",
  basePath,
  pageTitle,
  storageKeyPrefix,
  brandLabel,
  modelPattern,
}: BrandCollectionClientProps) {
  const [products, setProducts] = useState<BrandProduct[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)
  const [gridViewMode, setGridViewMode] = useState<GridViewMode>("product")
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // Filter states - initialized from URL params
  const [sortValue, setSortValue] = useState(currentFilters.sort)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(currentFilters.subcategories)
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors)
  const [selectedStyleTypes, setSelectedStyleTypes] = useState<string[]>(currentFilters.styles)
  const [filteredCount, setFilteredCount] = useState(totalCount)

  const scrollPositionKey = `${storageKeyPrefix}PageScrollPosition`
  const loadedCountKey = `${storageKeyPrefix}PageLoadedCount`

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem(scrollPositionKey)
      const savedProductCount = sessionStorage.getItem(loadedCountKey)

      if (savedProductCount && savedScrollPosition) {
        const targetCount = Number.parseInt(savedProductCount, 10)
        const scrollY = Number.parseInt(savedScrollPosition, 10)

        if (targetCount > initialProducts.length) {
          const supabase = createBrowserClient()

          try {
            let restoreQuery = supabase
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
                ),
                product_images_cf (
                  id,
                  cf_image_id,
                  alt_text,
                  sort_order,
                  role,
                  category_image
                )
              `)
              .in("brand", brands)
              .eq("category", category)
              .eq("status", "live")

            if (modelPattern) {
              restoreQuery = restoreQuery.filter("model", "imatch", modelPattern)
            }

            const { data: productsData, error } = await restoreQuery
              .order("created_at", { ascending: false })
              .range(0, targetCount - 1)

            if (!error && productsData && productsData.length > 0) {
              const optimizedProducts = optimizeCollectionsProducts(productsData)

              setProducts(optimizedProducts)
              setCurrentOffset(productsData.length)
            }
          } catch (error) {
            console.error(`[v0] Error restoring ${storageKeyPrefix} state:`, error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem(scrollPositionKey)
        sessionStorage.removeItem(loadedCountKey)
      }

      setIsRestoring(false)
    }

    restoreState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts.length])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(scrollPositionKey, window.scrollY.toString())
      sessionStorage.setItem(loadedCountKey, products.length.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [products.length, scrollPositionKey, loadedCountKey])

  const hasMore = products.length < filteredCount

  // Update filtered count when filters change
  useEffect(() => {
    const updateCount = async () => {
      const count = await getFilteredBrandCount({
        brands,
        category,
        subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        styles: selectedStyleTypes.length > 0 ? selectedStyleTypes : undefined,
        modelPattern,
      })
      setFilteredCount(count)
    }

    updateCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcategories, selectedColors, selectedStyleTypes])

  // Build filter URL
  const buildFilterUrl = () => {
    const params = new URLSearchParams()

    if (selectedSubcategories.length > 0) {
      params.set("subcategory", selectedSubcategories.join(","))
    }

    if (selectedColors.length > 0) {
      params.set("color", selectedColors.join(","))
    }

    if (selectedStyleTypes.length > 0) {
      params.set("style", selectedStyleTypes.join(","))
    }

    if (sortValue && sortValue !== "recommended") {
      params.set("sort", sortValue)
    }

    return `${basePath}${params.toString() ? `?${params.toString()}` : ""}`
  }

  // Apply filters to navigate
  const applyFilters = () => {
    const url = buildFilterUrl()
    // Use window.location.href for full page reload with filters
    window.location.href = url
  }

  // Sort products (filtering is done server-side)
  const sortedProducts = [...products].sort((a: any, b: any) => {
    switch (sortValue) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      case "recommended":
      default:
        return 0 // Keep original order
    }
  })

  const handleResetFilters = () => {
    setSortValue("recommended")
    setSelectedSubcategories([])
    setSelectedColors([])
    setSelectedStyleTypes([])
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, currentOffset, isRestoring])

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      const isMobile = window.innerWidth < 1024
      const batchSize = isMobile ? LOAD_MORE_MOBILE : LOAD_MORE_DESKTOP

      let query = supabase
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
          ),
          product_images_cf (
            id,
            cf_image_id,
            alt_text,
            sort_order,
            role,
            category_image
          )
        `)
        .in("brand", brands)
        .eq("category", category)
        .eq("status", "live")

      if (modelPattern) {
        query = query.filter("model", "imatch", modelPattern)
      }

      // Apply the same filters that are active in the UI
      if (selectedSubcategories.length > 0) {
        query = query.in("sub_category", selectedSubcategories)
      }

      if (selectedColors.length > 0) {
        query = query.in("color_filter", selectedColors)
      }

      if (selectedStyleTypes.length > 0) {
        query = query.in("style_type", selectedStyleTypes)
      }

      // Apply sorting
      if (sortValue === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sortValue === "price-low") {
        query = query.order("price", { ascending: true })
      } else if (sortValue === "price-high") {
        query = query.order("price", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      query = query.range(currentOffset, currentOffset + batchSize - 1)

      const { data: productsData, error } = await query

      if (error) {
        console.error(`[v0] Error loading more ${storageKeyPrefix} products:`, error)
        return
      }

      if (productsData && productsData.length > 0) {
        const optimizedProducts = optimizeCollectionsProducts(productsData)

        const existingIds = new Set(products.map((p) => p.id))
        const uniqueNewProducts = optimizedProducts.filter((p) => !existingIds.has(p.id))

        if (uniqueNewProducts.length > 0) {
          setProducts((prev) => [...prev, ...uniqueNewProducts])
          setCurrentOffset((prev) => prev + productsData.length)
        }
      }
    } catch (error) {
      console.error(`[v0] Exception loading more ${storageKeyPrefix} products:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-10 px-4 max-w-2xl">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.01em] mb-4 text-[#111111] uppercase leading-[1.05]">
            {pageTitle}
          </h1>
          <p className="text-[13px] md:text-sm leading-relaxed text-[#6F7075] font-normal">
            Every {brandLabel} item in this selection is carefully authenticated before being offered by Saint Yve.{" "}
            <Link href="/authenticity" className="text-[#111111] underline underline-offset-2 hover:text-[#6F7075]">
              Learn about our authentication process
            </Link>
            .
          </p>
        </div>

        {/* Filter & Grid View Toggles - Mobile Only */}
        <div className="lg:hidden flex justify-between items-center gap-4 px-4 py-4">
          <FilterSort
            sortValue={sortValue}
            onSortChange={setSortValue}
            subcategories={filterOptions.subcategories}
            brands={filterOptions.brands}
            colors={filterOptions.colors}
            styleTypes={filterOptions.styleTypes}
            selectedSubcategories={selectedSubcategories}
            selectedColors={selectedColors}
            selectedStyleTypes={selectedStyleTypes}
            onSubcategoryChange={setSelectedSubcategories}
            onColorChange={setSelectedColors}
            onStyleTypeChange={setSelectedStyleTypes}
            onReset={handleResetFilters}
            productCount={filteredCount}
            onApply={applyFilters}
          />

          <GridView gridViewMode={gridViewMode} onGridViewModeChange={setGridViewMode} />
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          <>
            {/* Desktop Layout - Always 4-column grid, styled like the /collections page */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-x-1 gap-y-5">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  hidePrice
                  emphasizedTitle
                  preloadSecondImage
                  aspectRatio="4/5"
                  hideColorInTitle
                  showVariantDetails
                  soldOut={(product as any).soldOut}
                />
              ))}
            </div>

            {/* Mobile Layout - Conditional based on gridViewMode */}
            <div className="lg:hidden">
              {gridViewMode === "product" && (
                /* Product Grid: 2-column, name / color variants / see details */
                <div className="grid grid-cols-2 gap-x-[1px] gap-y-5">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product as any}
                      hidePrice
                      emphasizedTitle
                      preloadSecondImage
                      aspectRatio="4/5"
                      hideColorInTitle
                      showVariantDetails
                  soldOut={(product as any).soldOut}
                    />
                  ))}
                </div>
              )}

              {gridViewMode === "catalog" && (
                /* Catalog Grid: 1-column full-width, same product card styling */
                <div className="flex flex-col gap-y-5">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product as any}
                      hidePrice
                      emphasizedTitle
                      preloadSecondImage
                      aspectRatio="4/5"
                      hideColorInTitle
                      showVariantDetails
                  soldOut={(product as any).soldOut}
                    />
                  ))}
                </div>
              )}

              {gridViewMode === "compact" && (
                /* Compact Grid: 3-column images only, no gaps, no text */
                <div className="grid grid-cols-3">
                  {sortedProducts.map((product) => {
                    const sortedImages = product.product_images
                      ? [...product.product_images].sort((a, b) => a.display_order - b.display_order)
                      : []
                    const imageUrl = sortedImages.length > 0 ? sortedImages[0].url : product.image || "/placeholder.svg"

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="block relative w-full aspect-[3/4]"
                        prefetch={false}
                      >
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {(product as any).soldOut && (
                          <>
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 bg-white/25 backdrop-blur-[1.5px] backdrop-saturate-[0.85]"
                            />
                            <span className="absolute top-2 left-2 bg-white/70 px-1 py-0.5 text-[8px] font-medium uppercase leading-none tracking-[0.22em] text-black backdrop-blur-sm">
                              Sold
                            </span>
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
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
  )
}
