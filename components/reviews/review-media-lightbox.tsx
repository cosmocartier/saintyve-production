"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { ReviewMediaItem } from "@/lib/types/review"

interface ReviewMediaLightboxProps {
  media: ReviewMediaItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

const SWIPE_THRESHOLD = 50

export function ReviewMediaLightbox({ media, initialIndex, isOpen, onClose }: ReviewMediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Stop this from also reaching the reviews panel's own ESC listener
        // (both are attached to `document`, so this must run in the capture phase).
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

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Customer photo viewer"
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

      <img
        key={current.id}
        src={buildCfUrl(current.cf_image_id, "watermark") || "/placeholder.svg"}
        alt={current.alt_text || "Customer photo"}
        className="max-w-[90vw] max-h-[85vh] object-contain select-none animate-in fade-in zoom-in-95 duration-200"
        draggable={false}
        onClick={(e) => e.stopPropagation()}
      />

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            aria-label="Previous photo"
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
            aria-label="Next photo"
            className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </>
      )}
    </div>
  )
}
