"use client"

import type React from "react"
import { useState, useRef } from "react"

const images = [
  {
    src: "/images/img-8136.jpeg",
    alt: "Luxury streetwear styling with designer pieces",
  },
  {
    src: "/images/img-8161.jpeg",
    alt: "Designer bag collaboration showcase",
  },
  {
    src: "/images/img-8153.jpeg",
    alt: "Luxury lifestyle with premium sneakers",
  },
  {
    src: "/images/img-8156.jpeg",
    alt: "Editorial street style with designer accessories",
  },
]

export function LifestyleSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Threshold for swipe (50px)
    if (translateX > 50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (translateX < -50 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }

    setTranslateX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const currentX = e.clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    if (translateX > 50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (translateX < -50 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }

    setTranslateX(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp()
    }
  }

  return (
    <div className="w-full bg-white">
      <div className="w-full overflow-hidden">
        <div
          ref={sliderRef}
          className="cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
              transitionDuration: isDragging ? "0ms" : "500ms",
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full flex-[0_0_100%] px-6">
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator bar */}
      <div className="flex justify-center items-center gap-1.5 py-6 px-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative h-[1.5px] flex-1 max-w-[60px] transition-all duration-500 ease-out"
            aria-label={`Go to image ${index + 1}`}
          >
            <div
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                index === currentIndex ? "bg-black" : "bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
