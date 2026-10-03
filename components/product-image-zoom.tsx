"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  priority?: boolean
  onClick?: () => void
}

export function ProductImageZoom({ src, alt, className, imgClassName, priority, onClick }: ProductImageZoomProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative overflow-hidden bg-white cursor-pointer", className)} onClick={onClick}>
      {/* Main image - invisible preloader, seamless fade-in, no zoom */}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn(
          imgClassName || "w-full h-auto object-cover",
          "transition-opacity duration-500 ease-out",
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
        <div className="absolute inset-0 flex items-center justify-center bg-white text-zinc-400 text-xs tracking-wide uppercase">
          Image unavailable
        </div>
      )}
    </div>
  )
}
