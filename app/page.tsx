"use client"

import { useState, useEffect } from "react"
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
          <div className="fixed top-0 left-0 right-0 z-50">
            <Navigation />
          </div>

          <StackedBrandPages />
        </div>
      </div>
    </>
  )
}
