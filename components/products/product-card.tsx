"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { usePriceMode } from "@/contexts/price-mode-context"
import type { Product } from "@/lib/types/product"

interface ProductCardProps {
  product: Product & {
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
    is_bestseller?: boolean
    is_new_in?: boolean
    brand?: string
    model?: string
    color?: string
  }
  disableMobileGallery?: boolean
  disableHoverEffect?: boolean
  hidePrice?: boolean
  emphasizedTitle?: boolean
  preloadSecondImage?: boolean
  aspectRatio?: "1/1" | "3/4" | "4/5"
  hideColorInTitle?: boolean
  showVariantDetails?: boolean
}

export function ProductCard({
  product,
  disableMobileGallery = false,
  disableHoverEffect = false,
  hidePrice = false,
  emphasizedTitle = false,
  preloadSecondImage = false,
  aspectRatio = "3/4",
  hideColorInTitle = false,
  showVariantDetails = false,
}: ProductCardProps) {
  const { addItem } = useCart()
  const { toggleLike, isLiked } = useWishlist()
  const { useRetailPrice } = usePriceMode()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [prevTranslate, setPrevTranslate] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFilled, setShowFilled] = useState(false)

  const hasVariants = product.product_variants && product.product_variants.length > 0

  const sortedImages = product.product_images
    ? [...product.product_images].sort((a, b) => a.display_order - b.display_order)
    : []

  const allImages = sortedImages.length > 0 ? sortedImages.map((img) => img.url) : [product.image || "/placeholder.svg"]

  const totalImages = allImages.length

  const liked = isLiked(product.id)

  const hasSecondImage = totalImages >= 2

  // Get the correct price based on the toggle state
  const displayPrice = useRetailPrice ? (product.retail_price || product.price) : product.price

  const handleDragStart = (clientX: number) => {
    if (totalImages <= 1) return
    setIsDragging(true)
    setStartPos(clientX)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return

    const currentPosition = clientX
    const diff = currentPosition - startPos
    setCurrentTranslate(prevTranslate + diff)
  }

  const handleDragEnd = () => {
    if (!isDragging || !containerRef.current) return

    setIsDragging(false)
    const movedBy = currentTranslate - prevTranslate
    const containerWidth = containerRef.current.clientWidth

    if (Math.abs(movedBy) > containerWidth * 0.15) {
      if (movedBy < 0 && currentImageIndex < totalImages - 1) {
        setCurrentImageIndex((prev) => prev + 1)
      } else if (movedBy > 0 && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1)
      }
    }

    setCurrentTranslate(-currentImageIndex * containerWidth)
    setPrevTranslate(-currentImageIndex * containerWidth)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalImages <= 1) return
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const containerWidth = containerRef.current.clientWidth
      const newTranslate = -currentImageIndex * containerWidth
      setCurrentTranslate(newTranslate)
      setPrevTranslate(newTranslate)
    }
  }, [currentImageIndex, isDragging])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!hasVariants) {
      addItem({
        id: product.id,
        name: product.name,
        price: `EUR ${displayPrice}`,
        image: allImages[0],
        slug: product.slug,
      })
    }
  }

  const progressWidth = totalImages > 1 ? `${100 / totalImages}%` : "100%"
  const progressPosition =
    totalImages > 1 ? `${(currentImageIndex / (totalImages - 1)) * (100 - 100 / totalImages)}%` : "0%"

  const handleProductClick = (e: React.MouseEvent) => {
    // Don't navigate if user was dragging
    if (isDragging) {
      e.preventDefault()
      return
    }

    // Save current scroll position to sessionStorage
    sessionStorage.setItem("productsPageScrollPosition", window.scrollY.toString())
  }

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAnimating) return

    setIsAnimating(true)

    await toggleLike({
      id: product.id,
      name: product.name,
      price: `EUR ${displayPrice.toFixed(2)}`,
      image: allImages[0],
      slug: product.slug,
    })

    if (!liked) {
      // Liking animation
      setShowFilled(true)
      setTimeout(() => {
        setIsAnimating(false)
      }, 200)
    } else {
      // Unliking animation
      setTimeout(() => {
        setShowFilled(false)
        setIsAnimating(false)
      }, 150)
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block relative w-full"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        if (isDragging) {
          handleDragEnd()
        }
      }}
      prefetch={false}
    >
      <div
        className={`relative w-full ${
          aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "4/5" ? "aspect-[4/5]" : "aspect-[3/4]"
        } overflow-hidden bg-gray-50`}
      >
        {/* Mobile: Static first image (all pages) */}
        <div className="lg:hidden w-full h-full">
          {disableMobileGallery || totalImages === 1 ? (
            // Static image (Editorial Favourites or single image products)
            <img
              src={allImages[0] || "/placeholder.svg"}
              alt={`${product.name}`}
              className="mb-8 px-0"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          ) : (
            // Swipeable gallery (category pages with multiple images)
            <div
              ref={containerRef}
              className={`flex w-full h-full select-none ${totalImages > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
              style={{
                transform: `translateX(${currentTranslate}px)`,
                transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDragging) {
                  handleDragEnd()
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {allImages.map((imageUrl, index) => (
                <div key={index} className="w-full h-full flex-shrink-0">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    loading={preloadSecondImage && index === 1 ? "eager" : "lazy"}
                    fetchPriority={preloadSecondImage && index === 1 ? "high" : undefined}
                    decoding="async"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Hover preview with second image crossfade */}
        <div className="hidden lg:block w-full h-full relative">
          {/* First image - always visible */}
          <img
            src={allImages[0] || "/placeholder.svg"}
            alt={`${product.name}`}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
            draggable="false"
          />

          {/* Second image - fades in on hover (desktop only) */}
          {hasSecondImage && !disableHoverEffect && (
            <img
              src={allImages[1] || "/placeholder.svg"}
              alt={`${product.name} - Preview`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out pointer-events-none lg:group-hover:opacity-100"
              loading={preloadSecondImage ? "eager" : "lazy"}
              fetchPriority={preloadSecondImage ? "high" : undefined}
              decoding="async"
              draggable="false"
            />
          )}
        </div>

        <button
          onClick={handleToggleLike}
          className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <div className="relative w-4 h-4">
            {/* Empty star */}
            <img
              src="/images/star.png"
              alt="Wishlist"
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-150 ease-out ${
                liked || showFilled ? "opacity-0 scale-95" : "opacity-100 scale-100"
              } ${isAnimating && !liked ? "heart-tap" : ""}`}
              draggable="false"
            />
            {/* Filled star */}
            <img
              src="/images/star.png"
              alt="Liked"
              className={`absolute inset-0 w-full h-full object-contain transition-all ${
                liked || showFilled
                  ? isAnimating && !liked
                    ? "opacity-100 heart-fill-pop"
                    : "opacity-100 scale-100"
                  : "opacity-0 scale-90"
              }`}
              draggable="false"
            />
          </div>
        </button>

        {(product.is_bestseller || product.is_new_in) && (
          <div className="absolute top-3 left-3 z-10">
            {product.is_bestseller && (
              <div className="bg-black text-white text-[10px] font-mono font-normal uppercase tracking-wider px-1 py-1 mb-2">
                Best Seller
              </div>
            )}
            {product.is_new_in && (
              <div className="bg-black text-white text-[10px] font-mono font-normal uppercase tracking-wider px-2 py-1.5">
                New In
              </div>
            )}
          </div>
        )}

        {!disableMobileGallery && totalImages > 1 && (
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-0.5 bg-transparent">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{
                width: progressWidth,
                marginLeft: progressPosition,
              }}
            />
          </div>
        )}

      </div>
      <div className="bg-white pt-4 pb-6 px-2">
        <h3
          className={
            emphasizedTitle
              ? "text-[10px] font-bold uppercase text-black truncate tracking-tight"
              : "text-[14px] font-light text-black truncate tracking-tight"
          }
        >
          {product.brand && product.model
            ? hideColorInTitle || !product.color
              ? `${product.brand} ${product.model}`
              : `${product.brand} ${product.model} ${product.color}`
            : product.name}
        </h3>
        {!hidePrice && (
          <div className="mt-1.5">
            <p className="text-[14px] font-normal text-[#777] text-left">EUR {displayPrice.toFixed(2)}</p>
          </div>
        )}
        {showVariantDetails && (
          <>
            <p className="mt-1.5 text-[11px] font-light uppercase tracking-wide text-[#999]">
              {Math.max(product.product_variants?.length ?? 0, 1)}{" "}
              {Math.max(product.product_variants?.length ?? 0, 1) === 1 ? "Color" : "Colors"}
            </p>
            <p className="mt-4 inline-block border-b border-black pb-0.5 text-[11px] font-light uppercase tracking-wide text-black">
              See Details
            </p>
          </>
        )}
      </div>
    </Link>
  )
}
