"use client"

import { useState } from "react"

const ACCESSORIES_CATEGORIES = [
  { id: "belts", label: "Belts" },
  { id: "sunglasses", label: "Sunglasses" },
  { id: "hats-caps", label: "Hats & Caps" },
  { id: "scarves", label: "Scarves" },
  { id: "wallets", label: "Wallets & Cardholders" },
  { id: "jewelry", label: "Jewelry" },
  { id: "tech", label: "Tech Accessories" },
] as const

export function MensAccessoriesCategorySlider() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ACCESSORIES_CATEGORIES[0].id)

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // TODO: Wire this to actual category filtering once taxonomy is finalized
    // TODO: Add routing to individual category pages when ready
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-6">
        {ACCESSORIES_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                relative text-[14px] font-normal tracking-wide whitespace-nowrap pb-2 
                transition-all duration-160 ease-out
                ${isActive ? "text-[#111111]" : "text-[#999999] hover:text-[#666666]"}
              `}
            >
              {category.label}

              <span
                className={`
                  absolute bottom-0 left-0 h-[1px] bg-[#111111] 
                  transition-all duration-160 ease-out
                  ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}
                `}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
