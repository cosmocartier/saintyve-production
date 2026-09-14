"use client"

import { useEffect, useState, useRef } from "react"

interface FloatingAddToCartBarProps {
  isInWishlist?: boolean
  onToggleWishlist?: () => void
  isAddToCartDisabled?: boolean
  isAddingToCart?: boolean
  onAddToCart: () => void
  addToCartLabel?: string
}

export function FloatingAddToCartBar({
  isInWishlist = false,
  onToggleWishlist,
  isAddToCartDisabled = false,
  isAddingToCart = false,
  onAddToCart,
  addToCartLabel = "ADD TO CART",
}: FloatingAddToCartBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // The floating bar's timing is driven entirely by the visibility of the
    // in-page add-to-cart button: as soon as it scrolls out of view, the
    // floating bar slides in to take its place. As soon as it scrolls back
    // into view (e.g. user scrolls back up), the floating bar slides out.
    const productAddToCartSection = document.querySelector("#product-add-to-cart")

    if (productAddToCartSection) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(!entry.isIntersecting)
          })
        },
        {
          threshold: 0,
          rootMargin: "-96px 0px 0px 0px",
        },
      )

      observerRef.current.observe(productAddToCartSection)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAnimating || !onToggleWishlist) return

    setIsAnimating(true)
    onToggleWishlist()
    setTimeout(() => setIsAnimating(false), 200)
  }

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="flex items-stretch gap-1.5 bg-white px-1.5 pb-1.5 pt-1">
        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={isAddToCartDisabled}
          className="flex-1 h-[60px] bg-[#111111] text-white flex items-center px-6 uppercase text-sm font-normal tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isAddingToCart ? "ADDING..." : addToCartLabel}
        </button>

        {/* Chat Button */}
        <a
          href="https://wa.me/yourwhatsappnumber"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center border border-black transition-all active:scale-[0.98]"
          aria-label="Chat with us"
        >
          <img src="/images/chat-icon.png" alt="Chat" className="w-5 h-5 object-contain" draggable="false" />
        </a>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={handleToggleWishlist}
            className="w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center border border-black transition-all active:scale-[0.98]"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <img
              src="/images/star.png"
              alt=""
              className={`w-5 h-5 object-contain transition-transform duration-150 ease-out ${
                isAnimating ? "scale-90" : "scale-100"
              }`}
              draggable="false"
            />
          </button>
        )}
      </div>
    </div>
  )
}
