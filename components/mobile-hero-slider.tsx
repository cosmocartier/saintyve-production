"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface HeroSlide {
  id: number
  image: string
  alt: string
}

const slides: HeroSlide[] = [
  {
    id: 1,
    image: "/images/dior-backpack-hero.jpg",
    alt: "Luxury Designer Backpack",
  },
  {
    id: 2,
    image: "/images/official-images-of-the-travis-scott-x-air-jordan-1-low-og-v0-bjfrddwkfp6e1.jpg",
    alt: "Travis Scott x Air Jordan 1 Low",
  },
]

export function MobileHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reset progress when slide changes
    setProgress(0)

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100
        }
        return prev + 100 / 70 // Update every 100ms for 7000ms total (100ms * 70 = 7000ms)
      })
    }, 100)

    // Slide timer - 7 seconds per slide
    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(slideTimer)
    }
  }, [currentSlide])

  return (
    <div className="relative w-full h-screen">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img src={slide.image || "/placeholder.svg"} alt={slide.alt} className="w-full h-full object-cover" />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="text-center px-6 flex flex-col items-center">
          
          
          <Link
            href="/products"
            className="mt-4 inline-block bg-white/20 backdrop-blur-md text-white text-[12px] font-normal uppercase transition-opacity hover:opacity-80"
            style={{
              letterSpacing: "0.12em",
              borderRadius: "999px",
              padding: "11px 34px",
            }}
          >
            Shop New Arrivals
          </Link>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-2.5 h-2.5 cursor-pointer"
            onClick={() => setCurrentSlide(index)}
            role="button"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Static grey circle for inactive dots */}
            {index !== currentSlide && <div className="w-full h-full rounded-full bg-gray-400/60 backdrop-blur-sm" />}

            {/* Active indicator with rotating progress - no inner fill */}
            {index === currentSlide && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="5"
                  strokeDasharray={`${progress} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-100 ease-linear"
                  style={{
                    filter: "drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))",
                  }}
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
