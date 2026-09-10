"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

type Gender = "women" | "men"

interface Category {
  label: string
  slug: string
  imageUrl: string
}

interface CategoryConfig {
  women: Category[]
  men: Category[]
}

const CATEGORIES: CategoryConfig = {
  women: [
    {
      label: "Women's Bags",
      slug: "bags",
      imageUrl: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/688655d7-fd4f-4b52-e058-f153d12ab300/w=800",
    },
    {
      label: "Women's Shoes",
      slug: "shoes",
      imageUrl: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/272525d6-2d1c-49b0-eaee-303a1f2a8c00/w=8000",
    },
    {
      label: "Women's Accessories",
      slug: "accessories",
      imageUrl: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/4818d940-e6ff-419d-e272-c1d49c5f2f00/w=800",
    },
    {
      label: "Women's Outerwear",
      slug: "outerwear",
      imageUrl: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/7fdf97bb-1b6b-4f04-07fd-e08ecad00600/w=800",
    },
  ],
  men: [
    {
      label: "Men's Outerwear",
      slug: "outerwear",
      imageUrl:
        "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/e193d803-0b49-4abf-ee76-3b7569cf2900/w=800",
    },
    {
      label: "Men's Sneakers",
      slug: "sneaker",
      imageUrl:
        "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/f7cfa633-2e74-4acb-37d6-e756727a9500/w=800",
    },
    {
      label: "Men's Bags",
      slug: "bags",
      imageUrl:
        "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/94999245-b2e0-4b07-d25e-126d99917700/w=800",
    },
    {
      label: "Men's Accessories",
      slug: "accessory",
      imageUrl:
        "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/09ea870b-22d4-4e9b-7ddd-c8ae39564400/w=800",
    },
  ],
}

function buildCategoryHref(gender: Gender, slug: string): string {
  if (gender === "women") {
    if (slug === "bags") {
      return "/womens/bags"
    }
    if (slug === "outerwear") {
      return "/womens/outerwear"
    }
    if (slug === "shoes") {
      return "/womens/shoes"
    }
    if (slug === "accessories") {
      return "/womens/accessories"
    }
  }
  if (gender === "men") {
    if (slug === "bags") {
      return "/mens/bags"
    }
    if (slug === "outerwear") {
      return "/mens/outerwear"
    }
    if (slug === "sneaker") {
      return "/mens/shoes"
    }
    if (slug === "accessory") {
      return "/mens/accessories"
    }
  }
  return `/all?gender=${gender}&category=${slug}`
}

interface GenderTabsProps {
  activeGender: Gender
  onGenderChange: (gender: Gender) => void
}

function GenderTabs({ activeGender, onGenderChange }: GenderTabsProps) {
  return (
    <div role="tablist" aria-label="Gender selection" className="flex items-center justify-center gap-8 mb-16">
      <button
        role="tab"
        aria-selected={activeGender === "women"}
        onClick={() => onGenderChange("women")}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            onGenderChange("men")
          }
        }}
        className={`text-[15px] font-normal tracking-tight transition-all duration-200 pb-1 relative ${activeGender === "women"
          ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-black"
          : "text-gray-400 hover:text-gray-600"
          }`}
      >
        Women
      </button>
      <button
        role="tab"
        aria-selected={activeGender === "men"}
        onClick={() => onGenderChange("men")}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            onGenderChange("women")
          }
        }}
        className={`text-[15px] font-normal tracking-tight transition-all duration-200 pb-1 relative ${activeGender === "men"
          ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-black"
          : "text-gray-400 hover:text-gray-600"
          }`}
      >
        Men
      </button>
    </div>
  )
}

interface CategoryTileProps {
  category: Category
  gender: Gender
}

function CategoryTile({ category, gender }: CategoryTileProps) {
  return (
    <Link href={buildCategoryHref(gender, category.slug)} className="group block transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden mb-4">
        <Image
          src={category.imageUrl || "/placeholder.svg"}
          alt={category.label}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />
      </div>
      <p className="text-center text-[14px] font-normal text-black tracking-tight group-hover:underline pb-6">
        {category.label}
      </p>
    </Link>
  )
}

export function CategorySwitcherSection() {
  const [activeGender, setActiveGender] = useState<Gender>("women")

  const currentCategories = CATEGORIES[activeGender]

  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-full">
        {/* Section header */}
        <div className="text-center mb-6 px-6 lg:px-12">
          <p className="text-[11px] font-normal text-gray-500 uppercase tracking-widest mb-3">Explore by Category</p>
          <p className="text-[14px] font-normal text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Evoking a winter's tale of memories, freedom, and wonder, the new collection shapes the holiday season into
            a perfect harmony of contrasts and elegance.
          </p>
        </div>

        {/* Gender tabs */}
        <div className="px-6 lg:px-12">
          <GenderTabs activeGender={activeGender} onGenderChange={setActiveGender} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
          {currentCategories.map((category) => (
            <CategoryTile key={`${activeGender}-${category.slug}`} category={category} gender={activeGender} />
          ))}
        </div>
      </div>
    </section>
  )
}
