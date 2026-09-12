"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { CartSidebar } from "@/components/cart-sidebar"
import { Navigation } from "@/components/navigation"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { Footer } from "@/components/footer"
import { CategorySwitcherSection } from "@/components/category-switcher-section"
import { CollectionShowcase } from "@/components/collection-showcase"


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
      <div
        className={`min-h-screen bg-white text-black font-mono transition-all duration-1000 ${isPageLoaded ? "opacity-100" : "opacity-0"
          }`}
      >
        <CartSidebar />

      <div id="main-content-wrapper">
        <section className="relative w-full">
          <div className="lg:hidden h-[80vh] w-full relative overflow-hidden">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/eaa3f4a2-930c-42dd-ba2c-6df92dfa0600/w=800"
              alt="Designer Fashion Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4">
              <Link
                href="/new-arrivals"
                className="inline-block text-[13px] font-bold uppercase text-white transition-opacity hover:opacity-80"
                style={{
                  letterSpacing: "0.12em",
                }}
              >
                Shop Collection
              </Link>
            </div>
          </div>

          <div className="hidden lg:block h-[80vh] w-full relative">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/6f4be294-0f91-4813-3e88-85e0cc2d1b00/w=800"
              alt="Luxury Designer Backpack"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4 lg:px-12">
              <Link
                href="/new-arrivals"
                className="inline-block text-[13px] font-bold uppercase text-white transition-opacity hover:opacity-80"
                style={{
                  letterSpacing: "0.12em",
                }}
              >
                Shop Collection
              </Link>
            </div>
          </div>
        </section>

        <div className="absolute top-0 left-0 right-0 z-50">
          <Navigation />
        </div>

        <CollectionShowcase
          title="Chanel"
          brand="Chanel"
          category="Bag"
          limit={4}
          seeMoreLink="/brands/chanel"
        />

        <CollectionShowcase
          title="Hermes"
          brand="Hermes"
          category="Bag"
          limit={4}
          seeMoreLink="/brands/hermes"
        />

        <CollectionShowcase
          title="Yves Saint Laurent"
          brand="YSL"
          category="Bag"
          limit={4}
          seeMoreLink="/brands/ysl"
        />

        {/* CategorySwitcherSection temporarily hidden from the landing page.
            To re-enable, uncomment the line below. */}
        {/* <CategorySwitcherSection /> */}

        <section className="bg-white py-24 lg:py-32 px-6 lg:px-12" id="newsletter-section">
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
