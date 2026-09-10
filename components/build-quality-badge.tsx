"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface BuildQualityBadgeProps {
  replicationAccuracy: number | null
  isProductPage?: boolean
}

export function BuildQualityBadge({ replicationAccuracy, isProductPage = false }: BuildQualityBadgeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Don't render if no score or not a product page
  if (!replicationAccuracy || !isProductPage) {
    return null
  }

  // Clamp 100 to 99
  const displayScore = replicationAccuracy === 100 ? 99 : replicationAccuracy

  useEffect(() => {
    if (!isProductPage) return

    const handleScroll = () => {
      // Show badge after scrolling past 80vh (approximately past the hero/first image)
      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight
      setIsVisible(scrollPosition > viewportHeight * 0.8)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [isProductPage])

  const handleBadgeClick = () => {
    setIsPanelOpen(true)
    // Prevent body scroll when panel is open
    document.body.style.overflow = "hidden"
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    document.body.style.overflow = ""
  }

  const getQualityLevel = (score: number): { range: string; description: string } => {
    if (score >= 90 && score <= 92) {
      return { range: "90–92", description: "High build quality" }
    } else if (score >= 93 && score <= 95) {
      return { range: "93–95", description: "Very high build quality" }
    } else if (score >= 96 && score <= 99) {
      return { range: "96–99", description: "Near-retail build quality" }
    }
    return { range: "", description: "" }
  }

  const qualityLevel = getQualityLevel(displayScore)

  return (
    <>
      {/* Badge */}
      <button
        onClick={handleBadgeClick}
        className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 bg-black text-white px-3 py-2 rounded transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        }}
        aria-label="View build quality details"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-normal tracking-wide uppercase">Quality</span>
          <span className="text-sm font-medium tracking-tight">
            {displayScore} <span className="text-xs text-white/70">/ 100</span>
          </span>
        </div>
      </button>

      {/* Slide-Up Panel */}
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-50 transition-opacity duration-300 ease-out"
            onClick={handleClosePanel}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClosePanel()
            }}
            role="button"
            tabIndex={0}
            aria-label="Close panel"
          />

          {/* Panel */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-black/60 backdrop-blur-md animate-slide-up-panel"
            style={{
              height: "90vh",
              maxHeight: "90vh",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="build-quality-title"
          >
            {/* Swipe indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-zinc-300 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClosePanel}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-zinc-600" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto h-full px-6 pb-8">
              {/* Header */}
              <div className="mb-6">
                <h2 id="build-quality-title" className="text-2xl text-white font-medium mb-2">
                  Build Quality
                </h2>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-medium">{displayScore}</span>
                  <span className="text-xl text-zinc-500">/ 100</span>
                </div>
                <p className="text-sm text-zinc-600">Internal quality assessment</p>
              </div>

              {/* What this means */}
              <section className="mb-8">
                <h3 className="text-base font-medium mb-3">What this means</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  This score reflects how closely the product matches retail references in materials, construction, and
                  overall finish.
                </p>
              </section>

              {/* What we assess */}
              <section className="mb-8">
                <h3 className="text-base font-medium mb-3">What we assess</h3>
                <ul className="space-y-2">
                  {[
                    "Materials & fabric",
                    "Shape & proportions",
                    "Stitching & construction",
                    "Hardware & branding placement",
                    "Overall visual consistency",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                      <span className="text-zinc-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* How to interpret the score */}
              <section className="mb-8">
                <h3 className="text-base font-medium mb-3">How to interpret the score</h3>
                <div className="space-y-3">
                  {[
                    { range: "90–92", desc: "High build quality" },
                    { range: "93–95", desc: "Very high build quality" },
                    { range: "96–99", desc: "Near-retail build quality" },
                  ].map((level) => (
                    <div
                      key={level.range}
                      className={`flex items-center justify-between py-2 px-3 rounded ${
                        qualityLevel.range === level.range ? "bg-zinc-100" : ""
                      }`}
                    >
                      <span className="text-sm font-medium">{level.range}</span>
                      <span className="text-sm text-zinc-600">→</span>
                      <span className="text-sm text-zinc-700">{level.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer */}
              <div className="pt-6 border-t border-zinc-200">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Benchmarked against verified retail reference models.
                  <br />
                  Scores may vary slightly between production batches.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-up-panel {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up-panel {
          animation: slide-up-panel 300ms ease-out forwards;
        }
      `}</style>
    </>
  )
}
