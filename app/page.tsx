"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CartSidebar } from "@/components/cart-sidebar"
import { Navigation } from "@/components/navigation"
import { StackedBrandPages } from "@/components/landing/stacked-brand-pages"

export default function BananaSportswearStorefront() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div
        className={`min-h-screen bg-white text-black font-mono transition-all duration-1000 ${isPageLoaded ? "opacity-100" : "opacity-0"
          }`}
      >
        <CartSidebar />

      <div id="main-content-wrapper">
        <section className="relative w-full">
          <div className="lg:hidden h-[100dvh] w-full relative overflow-hidden">
            <img
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/8e39a967-2a01-47dd-d44c-0e3758b09a00/w=800"
              alt="Designer Fashion Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-start justify-end pb-10 px-4">
              <Link
                href="/new-arrivals"
                className="inline-block text-[13px] font-bold uppercase text-black transition-opacity hover:opacity-80"
                style={{
                  letterSpacing: "0.12em",
                }}
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

        <StackedBrandPages />
      </div>
      </div>
    </>
  )
}
