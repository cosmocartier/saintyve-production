"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { FullPageSlider } from "@/components/landing/full-page-slider"
import { Footer } from "@/components/footer"

interface BrandPanelData {
  href: string
  label: string
  image: string
  alt: string
}

const brandPanels: BrandPanelData[] = [
  {
    href: "/brands/chanel",
    label: "Chanel",
    image: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/281daa67-db5b-490f-9446-72dd98ef8c00/w=800",
    alt: "Chanel Collection",
  },
  {
    href: "/brands/hermes",
    label: "Hermes",
    image: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/1d646663-a50a-4994-37b8-300aaf32d900/w=800",
    alt: "Hermes Collection",
  },
]

/** Tracks the lg breakpoint so the brand panels can switch between a single
 *  stacked column (mobile) and one side-by-side viewport (desktop). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return isDesktop
}

type RevealClass = (index: number) => string

function BrandColumn({ panel, revealed }: { panel: BrandPanelData; revealed: boolean }) {
  return (
    <Link
      href={panel.href}
      className={`group flex w-full max-w-[300px] flex-col items-center transition-all duration-700 ease-out lg:max-w-[480px] ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={panel.image || "/placeholder.svg"}
          alt={panel.alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mt-6 flex flex-col items-center gap-0.5 text-center">
        <span className="text-sm font-bold uppercase leading-tight text-foreground" style={{ letterSpacing: "0.12em" }}>
          {panel.label}
        </span>
        <span
          className="text-sm font-medium uppercase leading-tight text-muted-foreground"
          style={{ letterSpacing: "0.12em" }}
        >
          Shop
        </span>
      </div>
    </Link>
  )
}

function HeroSlide({ revealClass }: { revealClass: RevealClass }) {
  return (
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
  )
}

function BrandSlide({
  panel,
  slideIndex,
  activeIndex,
}: {
  panel: BrandPanelData
  slideIndex: number
  activeIndex: number
}) {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-background px-6 pt-18 lg:pt-0">
      <BrandColumn panel={panel} revealed={activeIndex === slideIndex} />
    </div>
  )
}

function DesktopBrandsSlide({ activeIndex, slideIndex }: { activeIndex: number; slideIndex: number }) {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center gap-24 bg-background px-16">
      <BrandColumn panel={brandPanels[0]} revealed={activeIndex === slideIndex} />
      <BrandColumn panel={brandPanels[1]} revealed={activeIndex === slideIndex} />
    </div>
  )
}

function FooterSlide({ activeIndex, slideIndex }: { activeIndex: number; slideIndex: number }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col justify-center bg-black">
      <div className={`transition-opacity duration-700 ${activeIndex === slideIndex ? "opacity-100" : "opacity-0"}`}>
        <Footer />
      </div>
    </div>
  )
}

/**
 * Full-screen landing experience: hero, brand panel(s), and the footer are
 * all slides of the same FullPageSlider, so a single scroll/swipe always
 * commits to one complete slide change — never a partial hover state.
 * On desktop both brands share a single viewport (side by side); on mobile
 * they remain separate slides.
 */
export function StackedBrandPages() {
  const isDesktop = useIsDesktop()
  const [activeIndex, setActiveIndex] = useState(0)

  const revealClass: RevealClass = (index) =>
    `transition-all duration-700 ease-out ${
      activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`

  if (isDesktop === null) {
    return <div className="fixed inset-0 h-[100dvh] w-full bg-background" />
  }

  const slides: ReactNode[] = isDesktop
    ? [
        <HeroSlide key="hero" revealClass={revealClass} />,
        <DesktopBrandsSlide key="brands" activeIndex={activeIndex} slideIndex={1} />,
        <FooterSlide key="footer" activeIndex={activeIndex} slideIndex={2} />,
      ]
    : [
        <HeroSlide key="hero" revealClass={revealClass} />,
        <BrandSlide key="chanel" panel={brandPanels[0]} slideIndex={1} activeIndex={activeIndex} />,
        <BrandSlide key="hermes" panel={brandPanels[1]} slideIndex={2} activeIndex={activeIndex} />,
        <FooterSlide key="footer" activeIndex={activeIndex} slideIndex={3} />,
      ]

  // The site header lives outside this component at a fixed z-50. The slider
  // normally stays beneath it, but once the footer becomes the active slide
  // it is raised above the header so the footer fully covers the nav.
  const isFooterActive = activeIndex === slides.length - 1

  return (
    <FullPageSlider
      key={isDesktop ? "desktop" : "mobile"}
      onIndexChange={setActiveIndex}
      className={isFooterActive ? "z-[60]" : "z-40"}
    >
      {slides}
    </FullPageSlider>
  )
}
