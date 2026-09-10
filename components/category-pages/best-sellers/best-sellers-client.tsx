"use client"

import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { CategoryNavigationTabs } from "@/components/category-pages/navigation-tabs"
import { CategoryFilterSortControls } from "@/components/category-filter-sort-controls"

interface BestSellersClientProps {
  products: Product[]
  totalCount: number
  brands: string[]
  currentPage: number
  currentBrand: string
  currentSort: string
}

const ITEMS_PER_PAGE = 24

export function BestSellersClient({
  products,
  totalCount,
  brands,
  currentPage,
  currentBrand,
  currentSort,
}: BestSellersClientProps) {
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const buildFilterUrl = (type: "brand" | "sort", value: string) => {
    const params = new URLSearchParams()

    if (type === "brand") {
      if (value) params.set("brand", value)
      if (currentSort !== "newest") params.set("sort", currentSort)
    } else if (type === "sort") {
      if (currentBrand) params.set("brand", currentBrand)
      if (value && value !== "newest") params.set("sort", value)
    }

    return `/best-sellers${params.toString() ? `?${params.toString()}` : ""}`
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (currentBrand) params.set("brand", currentBrand)
    if (currentSort !== "newest") params.set("sort", currentSort)
    if (page > 1) params.set("page", page.toString())

    return `/best-sellers${params.toString() ? `?${params.toString()}` : ""}`
  }

  const getSortLabel = (value: string) => {
    switch (value) {
      case "newest":
        return "Newest"
      case "price-low":
        return "Price: Low to High"
      case "price-high":
        return "Price: High to Low"
      default:
        return "Newest"
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Category Navigation */}
        <div className="mb-7 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-6 text-[#111111] uppercase">BEST SELLERS</h1>
          <div className="w-full h-[1px] bg-black/10" />
        </div>

        {/* Category Tabs */}
        <CategoryNavigationTabs currentCategory="best-sellers" />

        {/* SEO Intro Block */}
        <div className="mb-10 px-4 max-w-4xl">
          <p className="text-[13px] leading-relaxed text-[#444444] tracking-wide text-zinc-400">
            Our most popular items — the pieces our community loves most across all categories.
          </p>
        </div>

        {/* Filters */}
        <CategoryFilterSortControls
          brands={brands}
          currentBrand={currentBrand}
          currentSort={currentSort}
          totalCount={totalCount}
          brandDropdownOpen={brandDropdownOpen}
          setBrandDropdownOpen={setBrandDropdownOpen}
          sortDropdownOpen={sortDropdownOpen}
          setSortDropdownOpen={setSortDropdownOpen}
          brandRef={brandRef}
          sortRef={sortRef}
          buildFilterUrl={buildFilterUrl}
        />

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO BEST SELLERS FOUND</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} disableMobileGallery={true} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-12 mt-16 mb-8 px-4">
                {currentPage > 1 && (
                  <Link
                    href={buildPageUrl(currentPage - 1)}
                    className="text-[13px] font-medium uppercase tracking-[0.2em] text-[#444444] hover:text-black transition-colors relative group"
                  >
                    <span className="inline-block">← PREVIOUS</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
                  </Link>
                )}

                {currentPage < totalPages && (
                  <Link
                    href={buildPageUrl(currentPage + 1)}
                    className="text-[13px] font-medium uppercase tracking-[0.2em] text-[#444444] hover:text-black transition-colors relative group"
                  >
                    <span className="inline-block">NEXT →</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
