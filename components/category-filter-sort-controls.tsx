"use client"

import type React from "react"
import Link from "next/link"
import { ChevronDown, Check } from "lucide-react"

interface CategoryFilterSortControlsProps {
  // Brand filter state
  brands: string[]
  currentBrand: string
  brandDropdownOpen: boolean
  setBrandDropdownOpen: (open: boolean) => void
  brandRef: React.RefObject<HTMLDivElement>

  // Sort state
  currentSort: string
  sortDropdownOpen: boolean
  setSortDropdownOpen: (open: boolean) => void
  sortRef: React.RefObject<HTMLDivElement>

  // URL builders
  buildFilterUrl: (type: "brand" | "sort", value: string) => string

  // Total count
  totalCount: number
}

export function CategoryFilterSortControls({
  brands,
  currentBrand,
  brandDropdownOpen,
  setBrandDropdownOpen,
  brandRef,
  currentSort,
  sortDropdownOpen,
  setSortDropdownOpen,
  sortRef,
  buildFilterUrl,
  totalCount,
}: CategoryFilterSortControlsProps) {
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
    <div className="px-4 mb-0">
      <div className="flex items-center justify-between">
        <div className="relative" ref={brandRef}>
          <button
            onClick={() => {
              setBrandDropdownOpen(!brandDropdownOpen)
              setSortDropdownOpen(false)
            }}
            className="flex items-center gap-2 py-2.5 text-[15px] font-normal text-[#111] tracking-[0.01em] hover:opacity-60 transition-opacity duration-[160ms]"
          >
            <span>{currentBrand || "All Brands"}</span>
            <ChevronDown
              className={`w-[14px] h-[14px] transition-transform duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                brandDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {brandDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBrandDropdownOpen(false)} />

              <div className="absolute top-full left-0 mt-2 bg-[#FAFAFA] rounded-[14px] min-w-[220px] z-50 shadow-[0_8px_24px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-top-1 duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                <div className="py-4 px-4">
                  <Link
                    href={buildFilterUrl("brand", "")}
                    onClick={() => setBrandDropdownOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-[14px] leading-[1.4] tracking-[0.01em] rounded-md transition-all duration-[160ms] ${
                      !currentBrand ? "font-medium text-[#111]" : "font-normal text-[#7A7A7A] hover:bg-black/[0.015]"
                    }`}
                  >
                    <span>All Brands</span>
                    {!currentBrand && <Check className="w-3.5 h-3.5 text-[#111] opacity-70" />}
                  </Link>

                  {brands.map((brand) => (
                    <Link
                      key={brand}
                      href={buildFilterUrl("brand", brand)}
                      onClick={() => setBrandDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-[14px] leading-[1.4] tracking-[0.01em] rounded-md transition-all duration-[160ms] ${
                        currentBrand === brand
                          ? "font-medium text-[#111]"
                          : "font-normal text-[#7A7A7A] hover:bg-black/[0.015]"
                      }`}
                    >
                      <span>{brand}</span>
                      {currentBrand === brand && <Check className="w-3.5 h-3.5 text-[#111] opacity-70" />}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen)
                setBrandDropdownOpen(false)
              }}
              className="flex items-center gap-2 py-2.5 text-[14px] font-normal text-[#7A7A7A] tracking-[0.01em] hover:text-[#2A2A2A] transition-colors duration-[160ms]"
            >
              <span>{getSortLabel(currentSort)}</span>
              <ChevronDown
                className={`w-[14px] h-[14px] transition-transform duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />

                <div className="absolute top-full right-0 mt-2 bg-[#FAFAFA] rounded-[14px] min-w-[200px] z-50 shadow-[0_8px_24px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-top-1 duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <div className="py-4 px-4">
                    <Link
                      href={buildFilterUrl("sort", "newest")}
                      onClick={() => setSortDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-[14px] leading-[1.4] tracking-[0.01em] rounded-md transition-all duration-[160ms] ${
                        currentSort === "newest"
                          ? "font-medium text-[#111]"
                          : "font-normal text-[#7A7A7A] hover:bg-black/[0.015]"
                      }`}
                    >
                      <span>Newest</span>
                      {currentSort === "newest" && <Check className="w-3.5 h-3.5 text-[#111] opacity-70" />}
                    </Link>

                    <Link
                      href={buildFilterUrl("sort", "price-low")}
                      onClick={() => setSortDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-[14px] leading-[1.4] tracking-[0.01em] rounded-md transition-all duration-[160ms] ${
                        currentSort === "price-low"
                          ? "font-medium text-[#111]"
                          : "font-normal text-[#7A7A7A] hover:bg-black/[0.015]"
                      }`}
                    >
                      <span>Price: Low to High</span>
                      {currentSort === "price-low" && <Check className="w-3.5 h-3.5 text-[#111] opacity-70" />}
                    </Link>

                    <Link
                      href={buildFilterUrl("sort", "price-high")}
                      onClick={() => setSortDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-[14px] leading-[1.4] tracking-[0.01em] rounded-md transition-all duration-[160ms] ${
                        currentSort === "price-high"
                          ? "font-medium text-[#111]"
                          : "font-normal text-[#7A7A7A] hover:bg-black/[0.015]"
                      }`}
                    >
                      <span>Price: High to Low</span>
                      {currentSort === "price-high" && <Check className="w-3.5 h-3.5 text-[#111] opacity-70" />}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-[13px] text-[#999] tracking-[0.01em] font-light">
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </div>
        </div>
      </div>
    </div>
  )
}
