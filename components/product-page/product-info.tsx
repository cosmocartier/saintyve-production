"use client"

import type React from "react"
import { useState } from "react"
import type { Product, ProductVariant } from "@/lib/types/product"
import { useRouter } from "next/navigation"
import { generateAltText } from "@/lib/generate-alt-text"

interface ProductInfoProps {
  product: Product
  brandName?: string
  colorVariants: Array<{
    id: string
    name: string
    slug: string
    color: string | null
    price: number
    primaryImage: string | null
    isCurrentProduct: boolean
  }>
  availableColors: Array<{
    name: string
    hex: string
    images: Array<{
      url: string
      alt_text?: string
    }>
    variants: ProductVariant[]
  }>
  selectedColor: string | null
  setSelectedColor: (color: string | null) => void
  setCurrentImageIndex: (index: number) => void
  selectedVariant: ProductVariant | null
  setSelectedVariant: (variant: ProductVariant | null) => void
  hasMultipleSizes: boolean
  isSizeDropdownOpen: boolean
  toggleSizeDropdown: () => void
  filteredVariants: ProductVariant[]
  handleSizeSelect: (variant: ProductVariant) => void
  handleAddToCart: () => void
  canAddToCart: boolean
  isAddingToCart: boolean
  setIsShippingOpen: (open: boolean) => void
  isInWishlist?: boolean
  onToggleWishlist?: () => void
  stockQuantity?: number | null
}

export function ProductInfo({
  product,
  brandName,
  colorVariants,
  availableColors,
  selectedColor,
  setSelectedColor,
  setCurrentImageIndex,
  selectedVariant,
  setSelectedVariant,
  hasMultipleSizes,
  isSizeDropdownOpen,
  toggleSizeDropdown,
  filteredVariants,
  handleSizeSelect,
  handleAddToCart,
  canAddToCart,
  isAddingToCart,
  setIsShippingOpen,
  isInWishlist = false,
  onToggleWishlist,
  stockQuantity = null,
}: ProductInfoProps) {
  const router = useRouter()
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false)

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlistAnimating || !onToggleWishlist) return

    setIsWishlistAnimating(true)
    onToggleWishlist()
    setTimeout(() => setIsWishlistAnimating(false), 200)
  }

  return (
    <div className="w-full px-6 py-12 lg:px-16 lg:py-16">
      <div className="max-w-md mx-auto">
        {colorVariants.length > 1 && (
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <span className="text-sm tracking-wide font-normal">Variant</span>
            </div>
            <div className="relative -mx-6 px-6 lg:-mx-0 lg:px-0">
              <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex justify-center pb-1 gap-1.5">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => router.push(`/products/${variant.slug}`)}
                      className={`relative w-[66px] h-[66px] flex-shrink-0 overflow-hidden transition-opacity duration-200 ${
                        variant.isCurrentProduct ? "opacity-100" : "opacity-40 hover:opacity-70"
                      }`}
                      title={variant.color || variant.name}
                    >
                      {variant.primaryImage ? (
                        <img
                          src={variant.primaryImage || "/placeholder.svg"}
                          alt={variant.color || variant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {/* Subtle fade shadow on right when scrollable */}
              <div className="absolute top-0 right-0 bottom-1 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none opacity-0 [.overflow-x-auto:has(+_&)]:opacity-100" />
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm tracking-wide font-normal">Colors</span>
              <span className="text-sm tracking-wide font-normal text-zinc-600">
                {selectedColor || availableColors[0]?.name}
              </span>
            </div>
            <div className="relative -mx-6 px-6 lg:-mx-0 lg:px-0">
              <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex gap-3 pb-1">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name)
                        setCurrentImageIndex(0)
                        if (
                          color.variants.length === 1 ||
                          !color.variants.some((v) => v.size && v.size.toLowerCase() !== "one size")
                        ) {
                          setSelectedVariant(color.variants[0])
                        } else {
                          setSelectedVariant(null)
                        }
                      }}
                      className={`relative w-[50px] h-[50px] flex-shrink-0 rounded-sm border transition-all duration-200 overflow-hidden ${
                        selectedColor === color.name ? "border-[#111111] border-1.5" : "border-zinc-300"
                      }`}
                      title={color.name}
                    >
                      {color.images.length > 0 ? (
                        <img
                          src={color.images[0].url || "/placeholder.svg"}
                          alt={
                            color.images[0].alt_text ||
                            generateAltText({
                              brand: brandName,
                              productName: product.name,
                              imageIndex: 0,
                            })
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {/* Subtle fade shadow on right when scrollable */}
              <div className="absolute top-0 right-0 bottom-1 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none opacity-0 [.overflow-x-auto:has(+_&)]:opacity-100" />
            </div>
          </div>
        )}

        {hasMultipleSizes && (
          <div className="mb-12 relative">
            {/* Trigger row */}
            <div className="flex border border-zinc-200">
              {/* Left cell — select size + chevron */}
              <button
                onClick={toggleSizeDropdown}
                className="flex flex-1 items-center justify-between px-4 py-4 text-left hover:bg-zinc-50 transition-colors"
                aria-expanded={isSizeDropdownOpen}
              >
                <span className="text-sm tracking-wide font-light text-zinc-700">
                  {selectedVariant ? selectedVariant.size || "ONE SIZE" : "Select size"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-zinc-500 transition-transform duration-200 ${isSizeDropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Vertical divider + right cell — Size Chart */}
              <div className="border-l border-zinc-200">
                <button className="px-5 py-4 h-full text-sm tracking-wide font-light text-zinc-700 hover:bg-zinc-50 transition-colors whitespace-nowrap">
                  Size Chart
                </button>
              </div>
            </div>

            {/* Dropdown options */}
            {isSizeDropdownOpen && (
              <div className="border border-t-0 border-zinc-200 bg-white z-10">
                {filteredVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSizeSelect(variant)}
                    disabled={variant.stock_quantity === 0}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm tracking-wide transition-colors
                      ${selectedVariant?.id === variant.id
                        ? "bg-zinc-50 font-normal text-black"
                        : variant.stock_quantity === 0
                          ? "text-zinc-300 cursor-not-allowed"
                          : "font-light text-zinc-700 hover:bg-zinc-50 hover:text-black"
                      }`}
                  >
                    <span>{variant.size || "ONE SIZE"}</span>
                    {variant.stock_quantity === 0 && (
                      <span className="text-xs tracking-wide text-zinc-300">Out of stock</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div id="product-add-to-cart" className="mb-6 flex items-stretch gap-1.5">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAddingToCart}
            className="flex-1 h-[52px] flex items-center justify-center px-6 rounded-none bg-[#111111] text-white cursor-pointer hover:bg-black/80 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase">
              {isAddingToCart
                ? "ADDING..."
                : !selectedVariant && hasMultipleSizes
                  ? "SELECT SIZE FIRST"
                  : "ADD TO CART"}
            </span>
          </button>

          <a
            href="https://wa.me/yourwhatsappnumber"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center border border-zinc-200 transition-all active:scale-[0.98]"
            aria-label="Chat with us"
          >
            <img src="/images/chat-icon.png" alt="Chat" className="w-4 h-4 object-contain" draggable="false" />
          </a>

          {onToggleWishlist && (
            <button
              onClick={handleToggleWishlist}
              className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center border border-zinc-200 transition-all active:scale-[0.98]"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <img
                src="/images/star.png"
                alt=""
                className={`w-5 h-5 object-contain transition-transform duration-150 ease-out ${
                  isWishlistAnimating ? "scale-90" : "scale-100"
                }`}
                draggable="false"
              />
            </button>
          )}
        </div>

        {stockQuantity !== null && (
          <p className="text-center text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">
            {stockQuantity === 0
              ? "Currently Unavailable"
              : stockQuantity === 1
                ? "1 Piece Available"
                : `${stockQuantity} Pieces Available`}
          </p>
        )}
      </div>
    </div>
  )
}
