"use client"

import Link from "next/link"

interface WomensShoesCategoryCarouselProps {
  activeCategoryLabel?: string | null
}

const SHOE_CATEGORIES = [
  {
    id: "heels",
    label: "HEELS",
    route: "/womens/shoes/heels",
  },
  {
    id: "boots",
    label: "BOOTS",
    route: "/womens/shoes/boots",
  },
  {
    id: "sandals",
    label: "SANDALS",
    route: "/womens/shoes/sandals",
  },
  {
    id: "flats",
    label: "FLATS",
    route: "/womens/shoes/flats",
  },
  {
    id: "sneakers",
    label: "SNEAKERS",
    route: "/womens/shoes/sneakers",
  },
] as const

export function WomensShoesCategoryCarousel({ activeCategoryLabel = null }: WomensShoesCategoryCarouselProps) {
  return (
    <div className="mb-8 px-4">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {SHOE_CATEGORIES.map((category) => {
          const isActive = activeCategoryLabel?.toUpperCase() === category.label

          return isActive ? (
            <span
              key={category.id}
              className="text-[12px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 text-[#000000] border-b border-[#444444]/15"
            >
              {category.label}
            </span>
          ) : (
            <Link
              key={category.id}
              href={category.route}
              className="text-[12px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 text-[#000000] border-b border-transparent hover:text-[#555555]"
            >
              {category.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
