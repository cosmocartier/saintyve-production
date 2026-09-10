"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/types/product"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Category[]
  totalCount: number
  initialLimit: number
  shopAllCategoryId: string
}

const LOAD_MORE_DESKTOP = 20
const LOAD_MORE_MOBILE = 20
const INITIAL_LOAD_LIMIT = 20 // Declared INITIAL_LOAD_LIMIT

export function ProductsClient({
  initialProducts,
  categories,
  totalCount,
  initialLimit,
  shopAllCategoryId,
}: ProductsClientProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all-items")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(initialLimit)
  const [isRestoring, setIsRestoring] = useState(true)
  const [categoryTotalCount, setCategoryTotalCount] = useState(totalCount)
  const router = useRouter()

  const loadCategoryProducts = async (categorySlug: string) => {
    if (categorySlug === "all-items") {
      // Reset to initial products for "All Items"
      setProducts(initialProducts)
      setCurrentOffset(initialLimit)
      setCategoryTotalCount(totalCount)
      return
    }

    setIsSwitchingCategory(true)

    try {
      const supabase = createBrowserClient()

      // Find the category by slug
      const { data: category } = await supabase.from("categories").select("id").eq("slug", categorySlug).single()

      if (!category) {
        console.error(`[v0] Category not found: ${categorySlug}`)
        setIsSwitchingCategory(false)
        return
      }

      // Fetch products for this category
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
        .eq("category_id", category.id)
        .eq("products.status", "live")
        .order("sort_order", { ascending: true })
        .limit(INITIAL_LOAD_LIMIT)

      if (error) {
        console.error("[v0] Error fetching category products:", error)
        setIsSwitchingCategory(false)
        return
      }

      const productsData =
        productCategories?.map((pc: any) => ({
          ...pc.products,
          sort_order: pc.sort_order,
        })) || []

      const optimizedProducts = productsData.map((product: any) => {
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
      setCurrentOffset(optimizedProducts.length)

      // Get total count for this category
      const { count } = await supabase
        .from("product_categories")
        .select("product_id, products!inner(status)", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("products.status", "live")

      setCategoryTotalCount(count || 0)
    } catch (error) {
      console.error("[v0] Exception loading category products:", error)
    } finally {
      setIsSwitchingCategory(false)
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug)
    loadCategoryProducts(categorySlug)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const restoreState = async () => {
      const savedScrollPosition = sessionStorage.getItem("productsPageScrollPosition")
      const savedProductCount = sessionStorage.getItem("productsPageLoadedCount")

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
              .eq("category_id", shopAllCategoryId)
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
            console.error("[v0] Error restoring products state:", error)
          }
        }

        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollY,
            behavior: "instant" as ScrollBehavior,
          })
        })

        sessionStorage.removeItem("productsPageScrollPosition")
        sessionStorage.removeItem("productsPageLoadedCount")
      }

      setIsRestoring(false)
    }

    restoreState()
  }, [initialProducts.length, shopAllCategoryId])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("productsPageScrollPosition", window.scrollY.toString())
      sessionStorage.setItem("productsPageLoadedCount", products.length.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [products.length])

  const hasMore = products.length < categoryTotalCount

  const loadMoreProducts = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      const isMobile = window.innerWidth < 1024
      const batchSize = isMobile ? LOAD_MORE_MOBILE : LOAD_MORE_DESKTOP

      let categoryId = shopAllCategoryId

      if (selectedCategorySlug !== "all-items") {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategorySlug)
          .single()

        if (category) {
          categoryId = category.id
        }
      }

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
        console.error("[v0] Error loading more products:", error)
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
      console.error("[v0] Exception loading more products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentCategoryName =
    selectedCategorySlug === "all-items"
      ? "ALL ITEMS"
      : categories.find((c) => c.slug === selectedCategorySlug)?.name.toUpperCase() || "ALL ITEMS"

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-7 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-6 text-[#111111] uppercase">
            {currentCategoryName}
          </h1>
          <div className="w-full h-[1px] bg-black/10" />
        </div>

        <div className="mb-8 px-4">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all-items")}
              className={`text-[15px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 ${
                selectedCategorySlug === "all-items"
                  ? "text-[#444444] border-b border-[#444444]/15"
                  : "text-[#888888] border-b border-transparent hover:text-[#555555]"
              }`}
            >
              ALL ITEMS
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`text-[15px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 ${
                  selectedCategorySlug === category.slug
                    ? "text-[#444444] border-b border-[#444444]/15"
                    : "text-[#888888] border-b border-transparent hover:text-[#555555]"
                }`}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {isSwitchingCategory ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {/* 3:4 aspect ratio skeleton matching product cards */}
                <div className="aspect-[3/4] bg-gray-200 mb-3" />
                {/* Product name skeleton */}
                <div className="h-3 bg-gray-200 mb-2 w-3/4" />
                {/* Price skeleton */}
                <div className="h-3 bg-gray-200 w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
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
