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

function BrandColumn({ panel }: { panel: BrandPanelData }) {
  return (
    <Link href={panel.href} className="group flex w-full max-w-[300px] flex-col items-center lg:max-w-[480px]">
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

function HeroSlide() {
  return (
    <section className="relative h-[100dvh] w-full">
      <div className="lg:hidden flex h-[100dvh] w-full flex-col items-center justify-center bg-background px-6">
        <div className="flex w-full max-w-[300px] flex-col items-center">
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/39a98d13-b0b2-42bf-47fe-1327b1fd4000/w=800"
              alt="Designer Fashion Hero"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-col items-center gap-0.5 text-center">
            <Link
              href="/new-arrivals"
              className="text-[13px] font-bold uppercase text-foreground transition-opacity hover:opacity-80"
              style={{ letterSpacing: "0.12em" }}
            >
              Shop Collection
            </Link>
          </div>
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
            className="inline-block text-[13px] font-bold uppercase text-white transition-opacity hover:opacity-80"
            style={{ letterSpacing: "0.12em" }}
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </section>
  )
}

function BrandSlide({ panel }: { panel: BrandPanelData }) {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-background px-6 pt-18 lg:pt-0">
      <BrandColumn panel={panel} />
    </div>
  )
}

function DesktopBrandsSlide() {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center gap-24 bg-background px-16">
      <BrandColumn panel={brandPanels[0]} />
      <BrandColumn panel={brandPanels[1]} />
    </div>
  )
}

function FooterSlide() {
  return (
    <div className="flex h-[100dvh] w-full flex-col justify-center bg-black">
      <Footer />
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

  if (isDesktop === null) {
    return <div className="fixed inset-0 h-[100dvh] w-full bg-background" />
  }

  const slides: ReactNode[] = isDesktop
    ? [<HeroSlide key="hero" />, <DesktopBrandsSlide key="brands" />, <FooterSlide key="footer" />]
    : [
        <HeroSlide key="hero" />,
        <BrandSlide key="chanel" panel={brandPanels[0]} />,
        <BrandSlide key="hermes" panel={brandPanels[1]} />,
        <FooterSlide key="footer" />,
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
