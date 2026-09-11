"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { CartSidebar } from "@/components/cart-sidebar"
import { Navigation } from "@/components/navigation"
import { NotificationBanner } from "@/components/notification-banner"
import { LandingPageLoader } from "@/components/landing-page-loader"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { Footer } from "@/components/footer"
import { CategorySwitcherSection } from "@/components/category-switcher-section"
import { CollectionShowcase } from "@/components/collection-showcase"
import { LookbookFocusCarousel } from "@/components/lookbook-focus-carousel"
import { OurReviews } from "@/components/reviews/our-reviews"


interface Product {
  id: string
  name: string
  price: string
  category: string
  image?: string
  video?: string
}

export default function BananaSportswearStorefront() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [newsletterError, setNewsletterError] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterStatus("loading")
    setNewsletterError("")

    const result = await subscribeToNewsletter(newsletterEmail)

    if (result.success) {
      setNewsletterStatus("success")
      setNewsletterEmail("")
    } else {
      setNewsletterStatus("error")
      setNewsletterError(result.error || "Failed to subscribe")
      setTimeout(() => {
        setNewsletterStatus("idle")
        setNewsletterError("")
      }, 3000)
    }
  }

  return (
    <>
      <LandingPageLoader />
      <div
        className={`min-h-screen bg-white text-black font-mono transition-all duration-1000 ${isPageLoaded ? "opacity-100" : "opacity-0"
          }`}
      >
        <CartSidebar />
        <OurReviews />

      <div id="main-content-wrapper">
        <section className="relative w-full">
          <div className="lg:hidden h-[80vh] w-full relative overflow-hidden">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/0c7026eb-7e14-4da7-4026-63fb2d6c9100/w=800"
              alt="Designer Fashion Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-[40px]">
              <Link
                href="/new-arrivals"
                className="inline-block backdrop-blur-md text-[12px] font-normal uppercase transition-opacity hover:opacity-80 mb-2"
                style={{
                  letterSpacing: "0.12em",
                  borderRadius: "999px",
                  padding: "11px 34px",
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                }}
              >
                Explore Now
              </Link>
            </div>
          </div>

          <div className="hidden lg:block h-[80vh] w-full relative">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/0c7026eb-7e14-4da7-4026-63fb2d6c9100/w=800"
              alt="Luxury Designer Backpack"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-[40px]">
              <Link
                href="/new-arrivals"
                className="inline-block backdrop-blur-md text-[12px] font-normal uppercase transition-opacity hover:opacity-80 text-background bg-black mb-[15px]"
                style={{
                  letterSpacing: "0.12em",
                  borderRadius: "999px",
                  padding: "11px 34px",
                }}
              >
                Shop New Arrivals
              </Link>
              <p
                className="text-[11px] font-normal text-zinc-800"
                style={{
                  letterSpacing: "0.12em",
                  opacity: 0.7,
                }}
              >
                Rated 4,8 / 5 on Trustpilot 
              </p>
            </div>
          </div>

          <NotificationBanner />
        </section>

        <div className="absolute top-0 left-0 right-0 z-50">
          <Navigation />
        </div>

        <CollectionShowcase
          title="New Arrivals"
          collection="new-arrivals"
          limit={4}
          seeMoreLink="/new-arrivals"
        />

        <CollectionShowcase
          title="Chanel"
          brand="Chanel"
          limit={4}
          seeMoreLink="/brands/chanel"
        />

        <CollectionShowcase
          title="Jordan 1 Travis Scott Edition"
          parentProduct="Jordan 1 Travis Scott Edition"
          limit={4}
        />

        <LookbookFocusCarousel />

        {/* CategorySwitcherSection temporarily hidden from the landing page.
            To re-enable, uncomment the line below. */}
        {/* <CategorySwitcherSection /> */}

        <section className="bg-white py-24 lg:py-32 px-6 lg:px-12 lg:pt-[0] lg:pt-[0] pt-[0] pt-[0]" id="newsletter-section">
          <div className="max-w-md mx-auto">
            {newsletterStatus === "success" ? (
              <div className="text-center min-h-[200px] flex flex-col justify-center">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-3">Thank you</p>
                <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                  You're now subscribed to our editorial updates.
                </p>
              </div>
            ) : (
              <>
                {/* Headline */}
                <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-4 text-center">
                  Stay Connected
                </h2>

                {/* Subline */}
                <p className="text-[13px] font-mono text-gray-600 leading-relaxed mb-10 text-center">
                  Early access to new arrivals, curated selections, and editorial updates — delivered occasionally,
                  never noisy.
                </p>

                {/* Form */}
                <form onSubmit={handleNewsletterSubmit} className="space-y-3 mb-6">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={newsletterStatus === "loading"}
                    className="w-full px-4 py-3 text-[13px] font-mono border border-gray-300 focus:outline-none focus:border-black transition-colors disabled:opacity-50 placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === "loading"}
                    className="w-full bg-black text-white px-4 py-3 text-[11px] font-mono uppercase tracking-[0.15em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newsletterStatus === "loading" ? "Subscribing..." : "Subscribe"}
                  </button>
                  {newsletterError && (
                    <p className="text-[11px] font-mono text-red-600 text-center">{newsletterError}</p>
                  )}
                </form>

                {/* Privacy note */}
                <p className="text-[11px] font-mono text-gray-500 text-center leading-relaxed">
                  We respect your inbox. Unsubscribe anytime.{" "}
                  <Link href="/privacy-policy" className="underline hover:text-black transition-colors">
                    Privacy policy
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
      </div>
    </>
  )
}
