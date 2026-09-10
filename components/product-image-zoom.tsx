"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  onClick?: () => void
}

export function ProductImageZoom({ src, alt, className, priority, onClick }: ProductImageZoomProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative overflow-hidden bg-[#F5F5F5] cursor-pointer", className)} onClick={onClick}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Main image - no zoom, just static display */}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "w-full h-auto object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "hidden",
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        loading={priority ? "eager" : "lazy"}
      />

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Image unavailable
        </div>
      )}
    </div>
  )
}
