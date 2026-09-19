"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Footer } from "@/components/footer"

gsap.registerPlugin(ScrollTrigger)

interface BrandPanel {
  href: string
  label: string
  image: string
  alt: string
}

const brandPanels: BrandPanel[] = [
  {
    href: "/brands/chanel",
    label: "Chanel",
    image: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/32f7853d-c8af-451b-5941-00a7cba17900/w=800",
    alt: "Chanel Collection",
  },
  {
    href: "/brands/hermes",
    label: "Hermes",
    image: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/bde95369-55ba-44e1-0390-df3e83768800/w=800",
    alt: "Hermes Collection",
  },
]

/**
 * Full-screen "page stack" section for the landing page.
 * Each panel is pinned via native CSS `position: sticky` with an increasing
 * z-index, so as the user scrolls, the next panel rises from the bottom of
 * the viewport and covers the previous one — a smooth, GPU-driven page
 * switch with zero scroll-jacking. GSAP + ScrollTrigger layer a subtle
 * content reveal on top of that mechanic as each panel locks into place.
 */
export function StackedBrandPages() {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = containerRef.current?.querySelectorAll<HTMLElement>("[data-panel]")

      panels?.forEach((panel) => {
        const reveal = panel.querySelector<HTMLElement>("[data-reveal]")
        if (!reveal) return

        gsap.fromTo(
          reveal,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top top+=1",
              toggleActions: "play none none reverse",
            },
          },
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {brandPanels.map((panel, index) => (
        <div
          key={panel.href}
          data-panel
          className="sticky top-0 h-[100dvh] w-full overflow-hidden"
          style={{ zIndex: 10 + index }}
        >
          <Link href={panel.href} className="group relative block h-full w-full">
            <img
              src={panel.image || "/placeholder.svg"}
              alt={panel.alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(125% 125% at 0% 100%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 22%, rgba(0,0,0,0.22) 42%, transparent 62%)",
              }}
            />
            <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4 lg:px-12">
              <span
                data-reveal
                className="inline-block text-[13px] font-bold uppercase text-white transition-opacity group-hover:opacity-80"
                style={{ letterSpacing: "0.12em" }}
              >
                {panel.label}
              </span>
            </div>
          </Link>
        </div>
      ))}

      <div
        data-panel
        className="sticky top-0 flex h-[100dvh] w-full flex-col justify-center bg-black"
        style={{ zIndex: 10 + brandPanels.length }}
      >
        <div data-reveal>
          <Footer />
        </div>
      </div>
    </div>
  )
}
