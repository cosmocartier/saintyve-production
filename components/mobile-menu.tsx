"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import gsap from "gsap"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { useToast } from "@/hooks/use-toast"

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

// Fast, precise easing — the drawer should feel instant, never sluggish.
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"
const EASE_IN = "cubic-bezier(0.7, 0, 0.84, 0)"
const OPEN_MS = 0.2
const CLOSE_MS = 0.16

export function MobileMenu({ hasScrolled }: { hasScrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const { toast } = useToast()

  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail || newsletterSubscribed) return

    const result = await subscribeToNewsletter(newsletterEmail)
    if (result.success) {
      setNewsletterSubscribed(true)
    } else {
      toast({
        title: "Subscription Failed",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open / close animation.
  useEffect(() => {
    if (!panelRef.current) return

    const panel = panelRef.current
    gsap.killTweensOf(panel)

    if (isOpen) {
      panel.style.pointerEvents = "auto"
      gsap.to(panel, { opacity: 1, duration: OPEN_MS, ease: EASE_OUT })
      closeButtonRef.current?.focus()
    } else {
      gsap.to(panel, {
        opacity: 0,
        duration: CLOSE_MS,
        ease: EASE_IN,
        onComplete: () => {
          panel.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  // Lock background scroll without a layout jump; restore exact position on close.
  useEffect(() => {
    if (!isOpen) return

    const scrollY = window.scrollY
    const body = document.body
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.width = "100%"

    return () => {
      body.style.position = ""
      body.style.top = ""
      body.style.left = ""
      body.style.right = ""
      body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Escape to close.
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen])

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuPortal = mounted
    ? createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="md:hidden fixed inset-0 h-[100dvh] w-full z-[10000] flex flex-col pointer-events-none opacity-0 overscroll-none bg-black/55 backdrop-blur-[28px]"
          style={{ willChange: "opacity" }}
        >
          {/* Close */}
          <div className="flex items-center justify-start px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-2 shrink-0">
            <button
              ref={closeButtonRef}
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex items-center justify-center h-11 w-11 -ml-3 cursor-pointer active:opacity-50 transition-opacity duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="1" y1="1" x2="13" y2="13" stroke="white" strokeWidth="1" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="white" strokeWidth="1" />
              </svg>
            </button>
          </div>

          {/* Editorial index */}
          <nav className="shrink-0 overflow-y-auto overscroll-contain px-6 pt-10" aria-label="Product houses">
            <div className="flex flex-col gap-10">
              {INDEX.map((entry) => (
                <div key={entry.brand}>
                  <Link
                    href={entry.href}
                    onClick={closeMenu}
                    className="inline-block font-sans font-normal text-[2.25rem] leading-none text-white active:opacity-50 transition-opacity duration-150"
                  >
                    {entry.brand}
                  </Link>

                  <div className="mt-4 flex flex-col gap-1">
                    {entry.items.map((item) =>
                      item.isMeta ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeMenu}
                          className="block py-1.5 font-sans text-white/40 text-[11px] tracking-normal active:opacity-50 transition-opacity duration-150"
                        >
                          {`N\u00B0 ${item.label}`}
                        </Link>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeMenu}
                          className="block py-1.5 font-sans text-white/60 text-xs font-medium tracking-[0.14em] uppercase active:text-white active:opacity-70 transition-opacity duration-150"
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

          {/* Negative space */}
          <div className="flex-1 min-h-8" />

          {/* Newsletter + footer, anchored to the bottom */}
          <div className="px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] shrink-0">
            <div className="flex items-center gap-3 border-b border-white/25 pb-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={newsletterSubscribed ? "Thank you" : "Email"}
                disabled={newsletterSubscribed}
                className="flex-1 min-w-0 bg-transparent font-sans text-white text-sm placeholder:text-white/40 focus:outline-none disabled:opacity-70"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNewsletterSubscribe()
                  }
                }}
              />
              {!newsletterSubscribed && (
                <button
                  onClick={handleNewsletterSubscribe}
                  aria-label="Subscribe to newsletter"
                  className="shrink-0 font-sans text-white/70 text-sm active:opacity-50 transition-opacity duration-150 py-2 -my-2"
                >
                  Subscribe
                </button>
              )}
            </div>

            <p className="mt-3 font-sans text-white/40 text-[11px] leading-relaxed">
              By providing your email address, you agree to our{" "}
              <Link href="/privacy-policy" onClick={closeMenu} className="underline underline-offset-2 text-white/50">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-5 font-sans text-white/25 text-[10px] tracking-wide">
              © {new Date().getFullYear()} Saint Yve
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <button
        onClick={openMenu}
        className="md:hidden flex items-center justify-center h-11 w-11 -ml-3 cursor-pointer active:opacity-60 transition-opacity duration-150 relative z-10"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="0" y="0" width="17" height="1.75" fill="black" />
          <rect x="6" y="8.75" width="11" height="1.75" fill="black" />
        </svg>
      </button>

      {menuPortal}
    </>
  )
}
