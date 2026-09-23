"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import gsap from "gsap"

// Editorial index — Saint Yve currently deals exclusively in these two
// houses. Keep this list short and deliberate; do not reintroduce a
// generic multi-brand / multi-category structure here.
const INDEX = [
  {
    brand: "CHANEL",
    href: "/brands/chanel",
    items: [
      { label: "25", href: "/brands/chanel/25", isMeta: true },
      { label: "Flap Bags", href: "/brands/chanel/flap-bags" },
      { label: "Shopper", href: "/brands/chanel/shopper" },
      { label: "Vanity", href: "/brands/chanel/vanity" },
      { label: "Tote", href: "/brands/chanel/tote" },
    ],
  },
  {
    brand: "HERMÈS",
    href: "/brands/hermes",
    items: [
      { label: "Birkin", href: "/brands/hermes" },
      { label: "Kelly", href: "/brands/hermes" },
    ],
  },
]

// Refined, fast easing — perceptible but never sluggish.
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"
const EASE_IN = "cubic-bezier(0.7, 0, 0.84, 0)"

export function MobileMenu({ hasScrolled }: { hasScrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    gsap.killTweensOf([sidebar, overlay])

    if (isOpen) {
      sidebar.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"

      gsap.to(sidebar, { x: "0%", duration: 0.32, ease: EASE_OUT })
      gsap.to(overlay, { opacity: 1, duration: 0.22, ease: EASE_OUT })
    } else {
      gsap.to(sidebar, {
        x: "-100%",
        duration: 0.26,
        ease: EASE_IN,
        onComplete: () => {
          sidebar.style.pointerEvents = "none"
        },
      })

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: EASE_IN,
        onComplete: () => {
          overlay.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuPortal = mounted
    ? createPortal(
        <>
          <div
            ref={overlayRef}
            onClick={closeMenu}
            className="fixed inset-0 z-[9999] bg-black/20 opacity-0 pointer-events-none md:hidden"
          />

          <div
            ref={sidebarRef}
            className="md:hidden fixed top-0 left-0 h-[100svh] w-full bg-black/95 backdrop-blur-xl z-[10000] flex flex-col pointer-events-none"
            style={{ transform: "translateX(-100%)", willChange: "transform" }}
          >
            {/* Close */}
            <div className="flex items-center justify-end px-6 pt-6 pb-2">
              <button onClick={closeMenu} aria-label="Close menu" className="cursor-pointer active:opacity-50 transition-opacity duration-150">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="white" strokeWidth="1.25" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="white" strokeWidth="1.25" />
                </svg>
              </button>
            </div>

            {/* Editorial index */}
            <nav className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-8">
              <div className="flex flex-col gap-14">
                {INDEX.map((entry) => (
                  <div key={entry.brand}>
                    <Link
                      href={entry.href}
                      onClick={closeMenu}
                      className="font-sans font-bold text-[2.5rem] leading-none text-white active:opacity-50 transition-opacity duration-150"
                    >
                      {entry.brand}
                    </Link>

                    <div className="mt-5 flex flex-col gap-3">
                      {entry.items.map((item) =>
                        item.isMeta ? (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={closeMenu}
                            className="font-sans text-white/40 text-[11px] tracking-normal active:opacity-50 transition-opacity duration-150"
                          >
                     current        {"N\u00B0 " + item.label}
                          </Link>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={closeMenu}
                            className="font-sans text-white/70 text-xs font-medium tracking-[0.18em] uppercase active:text-white active:opacity-70 transition-opacity duration-150"
                          >
                            {item.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="px-6 pb-8 pt-4">
              <div className="font-sans text-white/25 text-[10px] tracking-wide">© 2026 Saint Yve</div>
            </div>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <>
      <button
        onClick={openMenu}
        className="md:hidden cursor-pointer active:opacity-60 transition-opacity duration-150 relative z-10"
        aria-label="Open menu"
      >
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="17" height="1.75" fill="black" />
          <rect x="6" y="8.75" width="11" height="1.75" fill="black" />
        </svg>
      </button>

      {menuPortal}
    </>
  )
}
