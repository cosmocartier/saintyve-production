"use client"

import Link from "next/link"

interface WomensBagsCategoryCarouselProps {
  activeCategoryLabel?: string | null
}

const BAG_CATEGORIES = [
  {
    id: "shoulder",
    label: "SHOULDER BAGS",
    route: "/womens/bags/shoulder-bags",
  },
  {
    id: "tote",
    label: "TOTE BAGS",
    route: "/womens/bags/tote-bags",
  },
  {
    id: "crossbody",
    label: "CROSSBODY BAGS",
    route: "/womens/bags/crossbody-bags",
  },
  {
    id: "mini",
    label: "MINI BAGS",
    route: "/womens/bags/mini-bags",
  },
  {
    id: "tophandle",
    label: "TOP HANDLE BAGS",
    route: "/womens/bags/top-handle-bags",
  },
  {
    id: "travel",
    label: "TRAVEL BAGS",
    route: "/womens/bags/travel-bags",
  },
  {
    id: "wallet",
    label: "WALLETS & CARDHOLDERS",
    route: "/womens/bags/wallets",
  },
] as const

export function WomensBagsCategoryCarousel({ activeCategoryLabel = null }: WomensBagsCategoryCarouselProps) {
  return (
    <div className="mb-8 px-4">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {BAG_CATEGORIES.map((category) => {
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
