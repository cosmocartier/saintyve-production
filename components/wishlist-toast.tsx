"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface WishlistToastProps {
  isVisible: boolean
  productName: string
  productImage: string
  onClose: () => void
}

export function WishlistToast({ isVisible, productName, productImage, onClose }: WishlistToastProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Trigger animation after render
      setTimeout(() => setIsAnimating(true), 10)

      // Auto-hide after 3.5s
      const timer = setTimeout(() => {
        handleClose()
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShouldRender(false)
      onClose()
    }, 180)
  }

  if (!shouldRender) return null

  return (
    <>
      {/* Dim overlay */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none z-[100] transition-opacity duration-[180ms] ease-out ${
          isAnimating ? "opacity-[0.38]" : "opacity-0"
        }`}
      />

      {/* Toast - Fixed positioning to sit below nav bar at 80px with proper centering */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-[101] w-[calc(100%-32px)] max-w-[720px] transition-all duration-[250ms] ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: isAnimating ? "80px" : "72px",
        }}
      >
        <div className="bg-white rounded-[14px] shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex items-center gap-4 p-4 pr-3">
          {/* Product image */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={productImage || "/placeholder.svg"}
              alt={productName}
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-light text-black leading-snug">
              The item <span className="font-light">{productName}</span> has been added to your wishlist
            </p>
            <Link
              href="/wishlist"
              className="text-[15px] text-black underline hover:no-underline mt-1 inline-block"
              onClick={handleClose}
            >
              View your Wishlist
            </Link>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close notification"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </>
  )
}
