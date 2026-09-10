"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { GridView } from "../category-pages/grid-view"
import { FilterSort } from "../category-pages/filter-sort"
import type { FilterOptions } from "@/app/actions/get-filter-options"
import { getFilteredProductCount } from "@/app/actions/get-filtered-count"
import { getSmartSortedProducts } from "@/app/actions/get-smart-sorted-products"

interface MensWatchesClientProps {
  initialProducts: Product[]
  totalCount: number
  initialLimit: number
  categoryId: string
  activeCategoryLabel?: string | null
  pageTitle?: string
  filterOptions?: FilterOptions
  currentFilters?: {
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

export function MensWatchesClient({
  initialProducts,
  totalCount,
  initialLimit,
  categoryId,
  activeCategoryLabel = null,
  pageTitle = "MEN'S WATCHES",
  filterOptions = { subcategories: [], brands: [], colors: [], styleTypes: [] },
  currentFilters = { brands: [], subcategories: [], colors: [], styles: [], sort: "recommended" },
}: MensWatchesClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)
  const [gridViewMode, setGridViewMode] = useState<GridViewMode>("product")
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  const [sortValue, setSortValue] = useState(currentFilters.sort)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(currentFilters.subcategories)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands)
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors)
  const [selectedStyleTypes, setSelectedStyleTypes] = useState<string[]>(currentFilters.styles)
  const [filteredCount, setFilteredCount] = useState(totalCount)

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("mensWatchesPageScrollPosition")
      const savedProductCount = sessionStorage.getItem("mensWatchesPageLoadedCount")

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
                  product_images (
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
                    if (!cfImagesMap.has(img.product_id)) cfImagesMap.set(img.product_id, [])
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

              const optimizedProducts = restoredProducts.map((product: any) => {
                const images = product.use_cloudflare_images
                  ? cfImagesMap.get(product.id) || []
                  : product.product_images || []
                const imagesByColor = new Map<string, any>()
                images
                  .sort((a: any, b: any) => a.display_order - b.display_order)
                  .forEach((img: any) => {
                    const colorKey = img.color_name || "default"
                    if (!imagesByColor.has(colorKey)) imagesByColor.set(colorKey, img)
                  })
                return {
                  ...product,
                  product_images: Array.from(imagesByColor.values()),
                  has_multiple_images: images.length > imagesByColor.size,
                }
              })

              setProducts(optimizedProducts)
              setCurrentOffset(productCategories.length)
            }
          } catch (error) {
            console.error("[v0] Error restoring products state:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior })
        })

        sessionStorage.removeItem("mensWatchesPageScrollPosition")
        sessionStorage.removeItem("mensWatchesPageLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length, categoryId])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("mensWatchesPageScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("mensWatchesPageLoadedCount", products.length.toString())
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [products.length])

  const hasMore = products.length < filteredCount

  useEffect(() => {
    const updateCount = async () => {
      const count = await getFilteredProductCount({
        categoryId,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        styles: selectedStyleTypes.length > 0 ? selectedStyleTypes : undefined,
      })
      setFilteredCount(count)
    }
    updateCount()
  }, [categoryId, selectedBrands, selectedSubcategories, selectedColors, selectedStyleTypes])

  const buildFilterUrl = () => {
    const params = new URLSearchParams()
    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","))
    if (selectedSubcategories.length > 0) params.set("subcategory", selectedSubcategories.join(","))
    if (selectedColors.length > 0) params.set("color", selectedColors.join(","))
    if (selectedStyleTypes.length > 0) params.set("style", selectedStyleTypes.join(","))
    if (sortValue && sortValue !== "recommended") params.set("sort", sortValue)
    return `/mens/watches${params.toString() ? `?${params.toString()}` : ""}`
  }

  const applyFilters = () => {
    window.location.href = buildFilterUrl()
  }

  const handleResetFilters = () => {
    setSortValue("recommended")
    setSelectedSubcategories([])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedStyleTypes([])
  }

  const sortedProducts = [...products].sort((a: any, b: any) => {
    switch (sortValue) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      default:
        return 0
    }
  })

  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore || isRestoring) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoading && hasMore) loadMoreProducts()
      },
      { root: null, rootMargin: "400px", threshold: 0 },
    )

    observer.observe(loadMoreTriggerRef.current)
    return () => observer.disconnect()
  }, [isLoading, currentOffset, isRestoring])

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const isMobile = window.innerWidth < 1024
      const batchSize = isMobile ? LOAD_MORE_MOBILE : LOAD_MORE_DESKTOP

      if (sortValue === "recommended") {
        const { products: smartProducts, error } = await getSmartSortedProducts({
          categoryId,
          offset: currentOffset,
          limit: batchSize,
          brands: selectedBrands.length > 0 ? selectedBrands : undefined,
          subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : undefined,
          colors: selectedColors.length > 0 ? selectedColors : undefined,
          styles: selectedStyleTypes.length > 0 ? selectedStyleTypes : undefined,
        })

        if (error) { console.error("[v0] Error loading smart sorted products:", error); return }

        if (smartProducts && smartProducts.length > 0) {
          const existingIds = new Set(products.map((p) => p.id))
          const uniqueNew = smartProducts.filter((p) => !existingIds.has(p.id))
          if (uniqueNew.length > 0) {
            setProducts((prev) => [...prev, ...uniqueNew])
            setCurrentOffset((prev) => prev + uniqueNew.length)
          }
        }
      } else {
        const supabase = createBrowserClient()

        let query = supabase
          .from("product_categories")
          .select(`
            product_id,
            sort_order,
            products!inner (
              *,
              product_variants (id, size, stock_quantity),
              product_images (id, url, alt_text, display_order, color_name, color_hex)
            )
          `)
          .eq("category_id", categoryId)
          .eq("products.status", "live")

        if (selectedBrands.length > 0) query = query.in("products.brand", selectedBrands)
        if (selectedSubcategories.length > 0) query = query.in("products.sub_category", selectedSubcategories)
        if (selectedColors.length > 0) query = query.in("products.color_filter", selectedColors)
        if (selectedStyleTypes.length > 0) query = query.in("products.style_type", selectedStyleTypes)

        if (sortValue === "newest") query = query.order("products(created_at)", { ascending: false })
        else if (sortValue === "price-low") query = query.order("products(price)", { ascending: true })
        else if (sortValue === "price-high") query = query.order("products(price)", { ascending: false })
        else query = query.order("sort_order", { ascending: true })

        query = query.range(currentOffset, currentOffset + batchSize - 1)

        const { data: productCategories, error } = await query
        if (error) { console.error("[v0] Error loading more products:", error); return }

        if (productCategories && productCategories.length > 0) {
          const newProductsData = productCategories.map((pc: any) => ({ ...pc.products, sort_order: pc.sort_order }))

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
                if (!cfImagesMap.has(img.product_id)) cfImagesMap.set(img.product_id, [])
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

          const optimizedProducts = newProductsData.map((product: any) => {
            const images = product.use_cloudflare_images ? cfImagesMap.get(product.id) || [] : product.product_images || []
            const imagesByColor = new Map<string, any>()
            images
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .forEach((img: any) => {
                const colorKey = img.color_name || "default"
                if (!imagesByColor.has(colorKey)) imagesByColor.set(colorKey, img)
              })
            return {
              ...product,
              product_images: Array.from(imagesByColor.values()),
              has_multiple_images: images.length > imagesByColor.size,
            }
          })

          const existingIds = new Set(products.map((p) => p.id))
          const uniqueNew = optimizedProducts.filter((p) => !existingIds.has(p.id))
          if (uniqueNew.length > 0) {
            setProducts((prev) => [...prev, ...uniqueNew])
            setCurrentOffset((prev) => prev + productCategories.length)
          }
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
        <div className="mb-6 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-3 text-[#111111] uppercase">{pageTitle}</h1>
          <p className="text-[13px] text-[#111111] leading-relaxed mb-6">
            Explore our curated selection of men&apos;s watches, from classic dress timepieces to contemporary sport
            and luxury models. Each watch is carefully chosen for its craftsmanship, precision, and timeless design.
          </p>
        </div>

        <div className="flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-4">
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
          </div>
          <GridView gridViewMode={gridViewMode} onGridViewModeChange={setGridViewMode} />
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} disableMobileGallery={true} />
              ))}
            </div>

            {hasMore && (
              <div ref={loadMoreTriggerRef} className="h-20 flex items-center justify-center">
                {/* Invisible trigger for infinite scroll */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
