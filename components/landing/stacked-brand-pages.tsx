"use client"

import { useState } from "react"
import Link from "next/link"
import { FullPageSlider } from "@/components/landing/full-page-slider"
import { Footer } from "@/components/footer"

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
 * Full-screen landing experience: hero, each brand panel, and the footer are
 * all slides of the same FullPageSlider, so a single scroll/swipe always
 * commits to one complete slide change — never a partial hover state.
 */
export function StackedBrandPages() {
  const [activeIndex, setActiveIndex] = useState(0)

  const revealClass = (index: number) =>
    `transition-all duration-700 ease-out ${
      activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`

  return (
    <FullPageSlider onIndexChange={setActiveIndex}>
      <section className="relative h-[100dvh] w-full">
        <div className="lg:hidden h-[100dvh] w-full relative overflow-hidden">
          <img
            src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/8e39a967-2a01-47dd-d44c-0e3758b09a00/w=800"
            alt="Designer Fashion Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4">
            <Link
              href="/new-arrivals"
              className={`inline-block text-[13px] font-bold uppercase text-black transition-opacity hover:opacity-80 ${revealClass(0)}`}
              style={{ letterSpacing: "0.12em" }}
            >
              Shop Collection
            </Link>
          </div>
        </div>

        <div className="hidden lg:block h-[100dvh] w-full relative">
          <img
            src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/6f4be294-0f91-4813-3e88-85e0cc2d1b00/w=800"
            alt="Luxury Designer Backpack"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4 lg:px-12">
            <Link
              href="/new-arrivals"
              className={`inline-block text-[13px] font-bold uppercase text-white transition-opacity hover:opacity-80 ${revealClass(0)}`}
              style={{ letterSpacing: "0.12em" }}
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {brandPanels.map((panel, i) => {
        const slideIndex = i + 1
        return (
          <div key={panel.href} className="relative h-[100dvh] w-full overflow-hidden">
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
                  className={`inline-block text-[13px] font-bold uppercase text-white transition-opacity group-hover:opacity-80 ${revealClass(slideIndex)}`}
                  style={{ letterSpacing: "0.12em" }}
                >
                  {panel.label}
                </span>
              </div>
            </Link>
          </div>
        )
      })}

      <div className="flex h-[100dvh] w-full flex-col justify-center bg-black">
        <div className={revealClass(brandPanels.length + 1)}>
          <Footer />
        </div>
      </div>
    </FullPageSlider>
  )
}
