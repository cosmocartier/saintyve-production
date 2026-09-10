"use client"

import { useEffect, useState } from "react"

const notifications = [
  "Free Shipping on orders above 150€",
  "10% Discount for Newsletter Subscribers",
  "New Season Collection Now Available",
]

export function NotificationBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length)
        setIsTransitioning(false)
      }, 500)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    if (currentIndex === 1) {
      // "10% Discount for Newsletter Subscribers"
      const newsletterSection = document.getElementById("newsletter-section")
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <div
      className="relative w-full text-black overflow-hidden h-10 flex items-center justify-center cursor-pointer bg-[rgba(38,38,38,1)]"
      onClick={handleClick}
    >
      <div className="relative w-full max-w-7xl mx-auto px-4">
        <div
          className={`text-center text-xs font-mono tracking-widest uppercase transition-all duration-500 text-white font-medium ${
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {notifications[currentIndex]}
        </div>
      </div>
    </div>
  )
}
