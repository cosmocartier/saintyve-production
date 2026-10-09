import Link from "next/link"

// The three top-level destinations shown when the "Menu" site configuration
// is enabled. Shared by the mobile and desktop menus so both stay identical.
const MENU_CATEGORIES = [
  { label: "Our Collection", href: "/saintyve-our-collection" },
  { label: "Handbags", href: "/saintyve-handbags" },
  { label: "Shoes", href: "/saintyve-shoes" },
]

export function MenuCategories({ onNavigate }: { onNavigate: () => void }) {
  return (
    <ul className="flex flex-col border-t border-white/15">
      {MENU_CATEGORIES.map((category) => (
        <li key={category.href} className="border-b border-white/15">
          <Link
            href={category.href}
            onClick={onNavigate}
            className="group flex min-h-[5.5rem] items-center justify-between gap-4 py-6 text-white transition-opacity duration-150 active:opacity-50"
          >
            <span className="font-sans text-[2.25rem] font-light leading-none tracking-tight text-balance">
              {category.label}
            </span>
            <svg
              width="28"
              height="10"
              viewBox="0 0 28 10"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
            >
              <path d="M0 5h27M23 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  )
}
