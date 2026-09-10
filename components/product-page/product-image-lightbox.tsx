"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
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

export function ProductImageLightbox({ images, initialIndex, isOpen, onClose }: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imageRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024

  useEffect(() => {
    setCurrentIndex(initialIndex)
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
  }, [isOpen, currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
    setPanOffset({ x: 0, y: 0 })
  }

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
    setIsZoomed(!isZoomed)
    if (isZoomed) {
      setPanOffset({ x: 0, y: 0 })
    }
  }

  if (!isOpen) return null

  const currentImage = images[currentIndex]
  const mainImageSrc = isMobile ? currentImage.pdpSrc : currentImage.zoomSrc

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white/98 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-10 bg-gradient-to-b from-white/90 to-transparent">
        <div className="text-sm text-zinc-600">
          {currentIndex + 1} / {images.length}
        </div>

        {!isMobile && (
          <button
            onClick={toggleZoom}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-4 h-4" />
                Zoom Out
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4" />
                Click to Zoom
              </>
            )}
          </button>
        )}

        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center p-16 pt-24 pb-32">
        <div
          ref={imageRef}
          className={cn(
            "relative w-full h-full flex items-center justify-center overflow-hidden",
            !isMobile && isZoomed && "cursor-move",
          )}
          onClick={!isMobile ? toggleZoom : undefined}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveWhilePanning}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={mainImageSrc || "/placeholder.svg"}
            alt={currentImage.alt}
            className={cn(
              "max-w-full max-h-full object-contain select-none transition-transform duration-300 ease-out",
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

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnail Rail */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white/90 to-transparent">
        <div className="flex items-center justify-center gap-2 h-full px-6 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index)
                setIsZoomed(false)
                setPanOffset({ x: 0, y: 0 })
              }}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all",
                currentIndex === index
                  ? "border-zinc-900 scale-110"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={image.thumbSrc || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
