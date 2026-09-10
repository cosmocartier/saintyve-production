"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const SHOE_CATEGORIES = [
  {
    id: "sneakers",
    label: "Sneakers",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/Travis.jpg",
    route: "/mens/shoes/sneakers",
  },
  {
    id: "loafers",
    label: "Loafers",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/Prada%20Loafers.jpg",
    route: "/mens/shoes/loafers",
  },
  {
    id: "boots",
    label: "Boots",
    image: "/placeholders/category-boots.jpg",
    route: null,
  },
  {
    id: "slides",
    label: "Slides",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/Yeezy%20Slide.jpg",
    route: "/mens/shoes/slides",
  },
  {
    id: "sandals",
    label: "Sandals",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/chypre-sandal--222000ZH01-side-wm-4-0-0-2000-2000-q99_g.jpg",
    route: "/mens/shoes/sandals",
  },
  {
    id: "dress-shoes",
    label: "Dress Shoes",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/Loubouin%20Shoes.jpg",
    route: "/mens/shoes/dress-shoes",
  },
  {
    id: "running-trainers",
    label: "Running / Trainers",
    image:
      "https://pakchkjehxmkcqoxqwir.supabase.co/storage/v1/object/public/product-images/Untitled%20folder/Balenciaga%20Trainer.jpg",
    route: "/mens/shoes/trainers",
  },
] as const

interface MensShoesCategoryCarouselProps {
  activeCategoryLabel?: string | null
}

export function MensShoesCategoryCarousel({ activeCategoryLabel = null }: MensShoesCategoryCarouselProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategoryLabel)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleCategoryClick = (category: (typeof SHOE_CATEGORIES)[number]) => {
    if (category.route) {
      router.push(category.route)
    } else {
      // UI-only state for categories without routes
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

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 gap-px"
      >
        {SHOE_CATEGORIES.map((category) => {
          const isActive = activeCategoryLabel === category.label
          const hasError = imageErrors.has(category.id)

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group flex-shrink-0 snap-start"
            >
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
