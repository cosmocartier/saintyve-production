"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types"
import { CategoryNavigationTabs } from "@/components/category-pages/navigation-tabs"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import Link from "next/link"
import { FilterSort } from "@/components/category-pages/filter-sort"
import { GridView } from "@/components/category-pages/grid-view"
import type { FilterOptions } from "@/app/actions/get-filter-options"
import { useRouter } from "next/navigation"
import { getFilteredProductCount } from "@/app/actions/get-filtered-count"

interface OuterwearClientProps {
  initialProducts: Product[]
  totalCount: number
  initialLimit: number
  categorySlug: string
  filterOptions: FilterOptions
  currentFilters: {
    brands: string[]
    subcategories: string[]
    colors: string[]
    styles: string[]
    sort: string
  }
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20

type GridViewMode = "product" | "catalog" | "compact"

export function OuterwearClient({ initialProducts, totalCount, initialLimit, categorySlug, filterOptions, currentFilters }: OuterwearClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)
  const [gridViewMode, setGridViewMode] = useState<GridViewMode>("product")
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // Filter states - initialized from URL params
  const [sortValue, setSortValue] = useState(currentFilters.sort)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(currentFilters.subcategories)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands)
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors)
  const [selectedStyleTypes, setSelectedStyleTypes] = useState<string[]>(currentFilters.styles)
  const [filteredCount, setFilteredCount] = useState(totalCount)

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("outerwearPageScrollPosition")
      const savedProductCount = sessionStorage.getItem("outerwearPageLoadedCount")

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
                product_images (
                  id,
                  url,
                  alt_text,
                  display_order,
                  color_name,
                  color_hex
                )
              `)
              .eq("category", categorySlug)
              .eq("status", "live")
              .order("created_at", { ascending: false })
              .range(0, targetCount - 1)

            if (!error && restoredProducts && restoredProducts.length > 0) {

              const productsWithCf = restoredProducts.filter((p: any) => p.use_cloudflare_images)
              const cfProductIds = productsWithCf.map((p: any) => p.id)

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

              const optimizedProducts = restoredProducts.map((product: any) => ({
                ...product,
                product_images: product.use_cloudflare_images
                  ? cfImagesMap.get(product.id) || []
                  : product.product_images || [],
              }))

              setProducts(optimizedProducts)
              setCurrentOffset(restoredProducts.length)
            }
          } catch (error) {
            console.error("[v0] Error restoring products state:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem("outerwearPageScrollPosition")
        sessionStorage.removeItem("outerwearPageLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length, categorySlug])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("outerwearPageScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("outerwearPageLoadedCount", products.length.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [products.length])

  const hasMore = products.length < filteredCount

  // Update filtered count when filters change
  useEffect(() => {
    const updateCount = async () => {
      const count = await getFilteredProductCount({
        categorySlug,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        styles: selectedStyleTypes.length > 0 ? selectedStyleTypes : undefined,
      })
      setFilteredCount(count)
    }
    
    updateCount()
  }, [categorySlug, selectedBrands, selectedSubcategories, selectedColors, selectedStyleTypes])

  // Build filter URL
  const buildFilterUrl = () => {
    const params = new URLSearchParams()
    
    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(','))
    }
    
    if (selectedSubcategories.length > 0) {
      params.set("subcategory", selectedSubcategories.join(','))
    }
    
    if (selectedColors.length > 0) {
      params.set("color", selectedColors.join(','))
    }
    
    if (selectedStyleTypes.length > 0) {
      params.set("style", selectedStyleTypes.join(','))
    }
    
    if (sortValue && sortValue !== "recommended") {
      params.set("sort", sortValue)
    }
    
    return `/outerwear${params.toString() ? `?${params.toString()}` : ""}`
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
    setSelectedBrands([])
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
          )
        `)
        .eq("category", categorySlug)
        .eq("status", "live")

      // Apply the same filters that are active in the UI
      if (selectedBrands.length > 0) {
        query = query.in("brand", selectedBrands)
      }
      
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

      const { data: newProductsData, error } = await query

      if (error) {
        console.error("[v0] Error loading more products:", error)
        return
      }

      if (newProductsData && newProductsData.length > 0) {

        const productsWithCf = newProductsData.filter((p: any) => p.use_cloudflare_images)
        const cfProductIds = productsWithCf.map((p: any) => p.id)

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

        const optimizedProducts = newProductsData.map((product: any) => ({
          ...product,
          product_images: product.use_cloudflare_images
            ? cfImagesMap.get(product.id) || []
            : product.product_images || [],
        }))

        const existingIds = new Set(products.map((p) => p.id))
        const uniqueNewProducts = optimizedProducts.filter((p) => !existingIds.has(p.id))

        if (uniqueNewProducts.length > 0) {
          setProducts((prev) => [...prev, ...uniqueNewProducts])
          setCurrentOffset((prev) => prev + newProductsData.length)
        }
      }
    } catch (error) {
      console.error("[v0] Exception loading more products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Category Navigation */}
        <div className="mb-7 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-6 text-[#111111] uppercase">OUTERWEAR</h1>
        </div>

        <CategoryNavigationTabs currentCategory="outerwear" />

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
            selectedBrands={selectedBrands}
            selectedColors={selectedColors}
            selectedStyleTypes={selectedStyleTypes}
            onSubcategoryChange={setSelectedSubcategories}
            onBrandChange={setSelectedBrands}
            onColorChange={setSelectedColors}
            onStyleTypeChange={setSelectedStyleTypes}
            onReset={handleResetFilters}
            productCount={filteredCount}
            onApply={applyFilters}
          />

          <GridView 
            gridViewMode={gridViewMode} 
            onGridViewModeChange={setGridViewMode}
          />
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO OUTERWEAR FOUND</p>
          </div>
        ) : (
          <>
            {/* Desktop Layout - Always 4-column grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-px">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} disableMobileGallery={true} disableHoverEffect={true} />
              ))}
            </div>

            {/* Mobile Layout - Conditional based on gridViewMode */}
            <div className="lg:hidden">
              {gridViewMode === "product" && (
                /* Product Grid: 2-column with names and prices */
                <div className="grid grid-cols-2 gap-px">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} disableMobileGallery={true} disableHoverEffect={true} />
                  ))}
                </div>
              )}

              {gridViewMode === "catalog" && (
                /* Catalog Grid: 1-column full-width with names and prices */
                <div className="flex flex-col">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} disableMobileGallery={true} disableHoverEffect={true} />
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
