import Link from "next/link"

interface CategoryNavigationTabsProps {
  currentCategory: "all" | "shoes" | "bags" | "clothing" | "outerwear" | "accessories"
}

const categories = [
  { slug: "all", label: "ALL ITEMS", href: "/all" },
  { slug: "shoes", label: "SHOES", href: "/sneakers" },
  { slug: "bags", label: "BAGS", href: "/bags" },
  { slug: "clothing", label: "CLOTHING", href: "/clothing" },
  { slug: "outerwear", label: "OUTERWEAR", href: "/outerwear" },
  { slug: "accessories", label: "ACCESSORIES", href: "/accessories" },
] as const

export function CategoryNavigationTabs({ currentCategory }: CategoryNavigationTabsProps) {
  return (
    <div className="mb-8 px-4">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isActive = category.slug === currentCategory

          return isActive ? (
            <span
              key={category.slug}
              className="text-[12px] font-normal tracking-wide whitespace-nowrap pb-1 transition-all duration-200 text-[#000000] border-b border-[#444444]/15"
            >
              {category.label}
            </span>
          ) : (
            <Link
              key={category.slug}
              href={category.href}
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
