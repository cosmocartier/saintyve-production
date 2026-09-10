"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { FactoryMediaItem } from "@/lib/types/product"

interface FactoryMediaViewerProps {
  media: FactoryMediaItem[]
  productTitle: string
  isOpen: boolean
  onClose: () => void
}

const SWIPE_THRESHOLD = 50

export function FactoryMediaViewer({ media, productTitle, isOpen, onClose }: FactoryMediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (isOpen) setCurrentIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
      } else if (e.key === "ArrowLeft") handlePrevious()
      else if (e.key === "ArrowRight") handleNext()
    }
    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex])

  if (!isOpen) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) handlePrevious()
      else handleNext()
    }
    touchStartX.current = null
  }

  const current = media[currentIndex]
  if (!current) return null

  const canRenderCurrent =
    (current.media_type === "image" && !!current.cf_image_id) ||
    (current.media_type === "video" && !!current.video_url)

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Factory photos and videos for ${productTitle}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {media.length > 1 && (
        <span className="absolute top-4 left-4 lg:top-6 lg:left-6 text-[11px] font-mono text-white/60">
          {currentIndex + 1} / {media.length}
        </span>
      )}

      {canRenderCurrent ? (
        current.media_type === "image" ? (
          <img
            key={current.id}
            src={buildCfUrl(current.cf_image_id!, "watermark") || "/placeholder.svg"}
            alt={current.alt_text || `${productTitle} factory photo`}
            className="max-w-[90vw] max-h-[85vh] object-contain select-none animate-in fade-in zoom-in-95 duration-200"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <video
            key={current.id}
            src={current.video_url!}
            controls
            playsInline
            className="max-w-[90vw] max-h-[85vh] object-contain animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        )
      ) : (
        <div
          className="flex flex-col items-center gap-3 text-white/50 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageOff className="w-10 h-10" />
          <p className="text-[11px] font-mono uppercase tracking-wide">Media unavailable</p>
        </div>
      )}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            aria-label="Previous media"
            className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            aria-label="Next media"
            className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </>
      )}
    </div>
  )
}
