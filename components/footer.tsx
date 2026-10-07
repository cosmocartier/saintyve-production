"use client"

import { useSiteConfig } from "@/contexts/site-config-context"

// Footer links. Always visible underneath the tagline — no dropdown.
// Contact Us must appear before Legal.
interface FooterMenuItem {
  label: string
  href: string
}

const footerMenuItems: FooterMenuItem[] = [
  { label: "Contact Us", href: "/contact" },
  { label: "Legal", href: "/legal" },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { config } = useSiteConfig()

  // Landing Page configuration swaps the tagline only; everything else in
  // the footer is unaffected by this toggle.
  const tagline = config.landingPage ? "AVANT GARDE FASHION" : "Authentic Pre-Owned Luxury"

  return (
    <footer className="bg-black text-white">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-tight text-white">
          Saint Yve &copy; {year}
        </p>
        <p className="text-xs font-medium uppercase tracking-tight text-white">{tagline}</p>

        <nav aria-label="Footer" className="flex flex-col items-center gap-3">
          {footerMenuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-medium uppercase tracking-tight text-white underline decoration-1 underline-offset-4 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
