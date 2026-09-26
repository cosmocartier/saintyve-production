"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface ImageData {
  id: string
  thumbSrc: string
  pdpSrc: string
  zoomSrc: string
  alt: string
}

interface ProductImageLightboxProps {
  images: ImageData[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function ProductImageLightbox({ images, initialIndex, isOpen, onClose }: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }, [initialIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handlePrevious, handleNext, onClose])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || isMobile || !isZoomed) return

      const rect = imageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePos({ x, y })
    },
    [isMobile, isZoomed],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed || isMobile) return
    setIsPanning(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handleMouseMoveWhilePanning = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const toggleZoom = () => {
    if (isMobile) return
    setIsZoomed((prev) => {
      if (prev) setPanOffset({ x: 0, y: 0 })
      return !prev
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  if (!isOpen) return null

  const currentImage = images[currentIndex]
  const mainImageSrc = isMobile ? currentImage.pdpSrc : currentImage.zoomSrc
  const hasMultiple = images.length > 1

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 sm:px-8"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <button
          onClick={onClose}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/70 transition-colors hover:text-white"
          aria-label="Close"
        >
          Close
        </button>

        {hasMultiple && (
          <div className="text-[11px] font-medium tracking-[0.2em] text-white/50">
            {pad(currentIndex + 1)} / {pad(images.length)}
          </div>
        )}
      </div>

      {/* Main image */}
      <div className="absolute inset-0 flex items-center justify-center px-5 py-20 sm:px-16 sm:py-24">
        <div
          ref={imageRef}
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden",
            !isMobile && isZoomed && "cursor-move",
          )}
          onClick={!isMobile ? toggleZoom : undefined}
          onMouseMove={isZoomed ? handleMouseMoveWhilePanning : handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            key={currentIndex}
            src={mainImageSrc || "/placeholder.svg"}
            alt={currentImage.alt}
            crossOrigin="anonymous"
            className={cn(
              "max-h-full max-w-full select-none object-contain transition-transform duration-300 ease-out animate-in fade-in duration-150",
              isZoomed && "scale-[2.5]",
            )}
            style={
              isZoomed && !isMobile
                ? {
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: `scale(2.5) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  }
                : undefined
            }
            draggable={false}
          />
        </div>
      </div>

      {/* Prev / next controls */}
      {hasMultiple && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 flex h-12 w-10 -translate-y-1/2 items-center justify-center text-white/40 transition-colors hover:text-white/90 sm:left-5"
            aria-label="Previous image"
          >
            <span className="text-2xl font-light">&larr;</span>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 flex h-12 w-10 -translate-y-1/2 items-center justify-center text-white/40 transition-colors hover:text-white/90 sm:right-5"
            aria-label="Next image"
          >
            <span className="text-2xl font-light">&rarr;</span>
          </button>
        </>
      )}
    </div>
  )
}
