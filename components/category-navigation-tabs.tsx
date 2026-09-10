import Link from "next/link"

interface CategoryNavigationTabsProps {
  currentCategory: "all" | "sneakers" | "bags" | "watches" | "jackets" | "vests" | "jewelry" | "accessories"
}

const categories = [
  { slug: "all", label: "ALL ITEMS", href: "/all" },
  { slug: "sneakers", label: "SNEAKERS", href: "/sneakers" },
  { slug: "bags", label: "BAGS", href: "/bags" },
  { slug: "watches", label: "WATCHES", href: "/watches" },
  { slug: "jackets", label: "JACKETS", href: "/jackets" },
  { slug: "vests", label: "VESTS", href: "/vests" },
  { slug: "jewelry", label: "JEWELRY", href: "/jewelry" },
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
