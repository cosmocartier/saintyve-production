"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { useSiteConfig } from "@/contexts/site-config-context"

// Contact Us stays a plain link; Legal opens a dropdown of legal documents.
// The dropdown items are intentionally not linked yet.
const legalItems = [
  "Imprint",
  "Privacy Policy",
  "Terms of Service",
  "Refund Policy",
  "Accessibility",
  "Legal Warranty",
]

export function Footer() {
  const year = new Date().getFullYear()
  const { config } = useSiteConfig()
  const [legalOpen, setLegalOpen] = useState(false)
  const legalMenuId = useId()

  // Landing Page configuration removes the tagline entirely so the footer
  // goes straight from the copyright line to the links.
  const tagline = config.landingPage ? null : "Authentic Pre-Owned Luxury"

  return (
    <footer className="bg-black text-white">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-tight text-white">
          Saint Yve &copy; {year}
        </p>
        {tagline && (
          <p className="text-xs font-medium uppercase tracking-tight text-white">{tagline}</p>
        )}

        <nav aria-label="Footer" className="flex flex-col items-center gap-3">
          <a
            href="/contact"
            className="text-xs font-medium uppercase tracking-tight text-white underline decoration-1 underline-offset-4 transition-colors hover:text-white"
          >
            Contact Us
          </a>

          <div
            className="relative flex flex-col items-center"
            onKeyDown={(event) => {
              if (event.key === "Escape") setLegalOpen(false)
            }}
          >
            <button
              type="button"
              aria-expanded={legalOpen}
              aria-controls={legalMenuId}
              onClick={() => setLegalOpen((open) => !open)}
              className="relative -my-3 inline-flex min-h-11 items-center px-3 text-xs font-medium uppercase tracking-tight text-white"
            >
              <span className="underline decoration-1 underline-offset-4">Legal</span>
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1}
                className={`absolute left-full -ml-1 size-4 transition-transform duration-500 ease-out motion-reduce:transition-none ${
                  legalOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <ul
              id={legalMenuId}
              inert={!legalOpen}
              className={`absolute left-1/2 top-full flex w-max -translate-x-1/2 flex-col items-center gap-3 pt-4 ${
                legalOpen ? "visible" : "invisible delay-500"
              }`}
            >
              {legalItems.map((label, index) => (
                <li
                  key={label}
                  style={{ transitionDelay: legalOpen ? `${index * 60}ms` : "0ms" }}
                  className={`text-xs font-medium uppercase tracking-widest text-white/70 transition-all duration-500 ease-out motion-reduce:transition-none ${
                    legalOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
