"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

const OUTERWEAR_CATEGORIES = [
  {
    id: "puffer-jacket",
    label: "Puffer Jacket",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Screenshot%202025-12-09%20at%2013.09.17.jpg",
    route: "/mens/outerwear/puffer-jackets",
  },
  {
    id: "down-jacket",
    label: "Down Jacket",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/CG%20Down%20Jacket.jpg",
    route: "/mens/outerwear/down-jackets",
  },
  {
    id: "bomber-jacket",
    label: "Bomber Jacket",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Louis%20Vuitton%20Bomber%20Jacket%20Beige.jpg",
    route: "/mens/outerwear/bomber-jackets",
  },
  {
    id: "leather-jacket",
    label: "Leather Jacket",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Prada%20Leather%20Jacket.jpg",
    route: "/mens/outerwear/leather-jackets",
  },
  {
    id: "windbreaker",
    label: "Windbreaker",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Screenshot%202025-12-30%20at%2021.14.48.jpg",
    route: "/mens/outerwear/windbreaker", // Enabled routing for Windbreaker
  },
  {
    id: "parka",
    label: "Parka",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Screenshot%202025-11-19%20at%2010.46.38.jpg",
    route: "/mens/outerwear/parka", // Enabled routing for Parka
  },
  {
    id: "vest",
    label: "Vest",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Outerwear%20Category%20Images/Screenshot%202025-12-09%20at%2013.13.41.jpg",
    route: "/mens/outerwear/vests", // Enabled routing for Vest
  },
] as const

interface MensOuterwearCategoryCarouselProps {
  activeCategoryLabel?: string | null
}

export function MensOuterwearCategoryCarousel({ activeCategoryLabel = null }: MensOuterwearCategoryCarouselProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategoryLabel)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleCategoryClick = (category: (typeof OUTERWEAR_CATEGORIES)[number]) => {
    if (category.route) {
      router.push(category.route)
    } else {
      setSelectedCategory(category.label)
    }
  }

  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set([...prev, categoryId]))
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 300
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative w-full">
      {/* Desktop scroll arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 -ml-5"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-[#111111]" strokeWidth={1} />
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 -mr-5"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-[#111111]" strokeWidth={1} />
      </button>

      {/* Category carousel */}
      <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 gap-px">
        {OUTERWEAR_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.label
          const hasError = imageErrors.has(category.id)

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group flex-shrink-0 snap-start"
            >
              {/* 4:3 image thumbnail */}
              <div
                className={`
                  relative w-[140px] lg:w-[180px] aspect-[4/3] mb-3 overflow-hidden bg-[#F5F5F5]
                  transition-all duration-200 ease-out
                  ${isActive ? "ring-1 ring-[#111111] ring-inset" : ""}
                `}
              >
                {!hasError ? (
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.label}
                    fill
                    className={`
                      object-cover transition-all duration-200 ease-out
                      ${isActive ? "opacity-100 scale-100" : "opacity-90 scale-100 group-hover:scale-102 group-hover:opacity-100"}
                    `}
                    sizes="(max-width: 1024px) 140px, 180px"
                    onError={() => handleImageError(category.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
                    <div className="w-12 h-12 border border-[#E0E0E0] rounded-sm" />
                  </div>
                )}
              </div>

              {/* Category label with underline animation */}
              <div className="relative">
                <span
                  className={`
                    text-[13px] lg:text-[14px] font-normal tracking-wide
                    transition-colors duration-160 ease-out
                    ${isActive ? "text-[#111111]" : "text-[#999999] group-hover:text-[#666666]"}
                  `}
                >
                  {category.label}
                </span>

                <span
                  className={`
                    absolute -bottom-1 left-0 h-[1px] bg-[#111111]
                    transition-all duration-160 ease-out
                    ${isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-30"}
                  `}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
