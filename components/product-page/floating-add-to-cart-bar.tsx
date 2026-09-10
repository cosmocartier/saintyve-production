"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

interface FloatingAddToCartBarProps {
  price: number
  currency?: string
  isInWishlist?: boolean
  onToggleWishlist?: () => void
  isAddToCartDisabled?: boolean
  onAddToCart: () => void
}

export function FloatingAddToCartBar({
  price,
  currency = "EUR",
  isInWishlist = false,
  onToggleWishlist,
  isAddToCartDisabled = false,
  onAddToCart,
}: FloatingAddToCartBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [showFilled, setShowFilled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const SCROLL_THRESHOLD = 24

    // Handle scroll to detect if user has scrolled past threshold
    const handleScroll = () => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD
      setHasScrolled(scrolled)
    }

    // Create intersection observer for the product add-to-cart section
    const productAddToCartSection = document.querySelector("#product-add-to-cart")
    const youMayAlsoLikeSection = document.querySelector("#you-may-also-like")

    if (productAddToCartSection) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // If the product ATC section is visible, hide the floating bar
            // Otherwise, show it if user has scrolled
            if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
              setIsVisible(false)
            } else if (hasScrolled) {
              setIsVisible(true)
            }
          })
        },
        {
          threshold: [0, 0.15, 0.5, 1.0],
          rootMargin: "0px",
        },
      )

      observerRef.current.observe(productAddToCartSection)
    }

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasScrolled])

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAnimating || !onToggleWishlist) return

    setIsAnimating(true)

    onToggleWishlist()

    if (!isInWishlist) {
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
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-200 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] border-t border-black/10 px-4 py-5 flex items-center gap-4">
        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={isAddToCartDisabled}
          className="flex-1 h-[60px] bg-[#2c2c2c] text-white flex items-center justify-between px-6 uppercase text-sm font-normal tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ minHeight: "48px" }}
        >
          <div className="flex items-center gap-3">
            <Image
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/9a2f7cad-25c0-41eb-b3d8-c63ac6393300/iconmobile"
              alt="Shopping Bag"
              width={16}
              height={16}
              className="brightness-0 invert"
            />
            <span>ADD</span>
          </div>
          <span className="text-sm font-light tracking-wide">
            {price.toFixed(2)} {currency}
          </span>
        </button>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={handleToggleWishlist}
            className="w-[60px] h-[60px] flex items-center justify-center border border-black transition-all active:scale-[0.98]"
            style={{ minHeight: "48px", minWidth: "48px" }}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <div className="relative w-5 h-5">
              {/* Empty heart */}
              <img
                src="/images/heart-empty.png"
                alt="Wishlist"
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-150 ease-out ${
                  isInWishlist || showFilled ? "opacity-0 scale-95" : "opacity-100 scale-100"
                } ${isAnimating && !isInWishlist ? "heart-tap" : ""}`}
                draggable="false"
              />
              {/* Filled heart */}
              <img
                src="/images/heart-filled.png"
                alt="Liked"
                className={`absolute inset-0 w-full h-full object-contain transition-all ${
                  isInWishlist || showFilled
                    ? isAnimating && !isInWishlist
                      ? "opacity-100 heart-fill-pop"
                      : "opacity-100 scale-100"
                    : "opacity-0 scale-90"
                }`}
                draggable="false"
              />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
