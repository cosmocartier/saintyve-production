"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

// Footer dropdown links.
// To activate a link, add an `href` (e.g. "/authenticity", "/legal", "/contact").
interface FooterMenuItem {
  label: string
  href: string
}

const footerMenuItems: FooterMenuItem[] = [
  { label: "Authenticity", href: "/authenticity" },
  { label: "Legal", href: "/legal" },
  { label: "Contact Us", href: "/contact" },
]

export function Footer() {
  const year = new Date().getFullYear()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  return (
    <footer className="bg-black text-white">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-tight text-white">
          Saint Yve &copy; {year}
        </p>
        <p className="text-xs font-medium uppercase tracking-tight text-white">
          Authentic Pre-Owned Luxury
        </p>

        <div ref={containerRef} className="relative mt-3">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="true"
            className="flex items-center gap-1.5 text-xl font-bold uppercase tracking-tight text-white transition-colors hover:text-white/70"
          >
            Legal
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {open && (
            <nav
              aria-label="Footer"
              className="absolute top-full left-1/2 z-10 mt-5 flex -translate-x-1/2 flex-col items-center gap-4 whitespace-nowrap"
            >
              {footerMenuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
