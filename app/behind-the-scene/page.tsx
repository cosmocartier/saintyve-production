import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BehindTheScenesGallery } from "@/components/behind-the-scenes-gallery"
import { Play } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Behind the Scenes | Saint Yve",
  description:
    "A closer look at the craft, details, and process behind our pieces. Real production footage, quality checks, and finishing details.",
}

export default function BehindTheScenePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-4 leading-tight">
            Behind the Scenes
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mb-6">
            A closer look at the craft, details, and process behind our pieces.
          </p>
          {/* Micro-points */}
          <div className="flex flex-wrap gap-4 text-[12px] font-mono text-gray-500">
            <span>Real production footage</span>
            <span className="text-gray-300">·</span>
            <span>Quality checks & finishing details</span>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="pb-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-sm overflow-hidden group cursor-pointer">
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors duration-300">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 lg:w-10 lg:h-10 text-black ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-[18px] lg:text-[20px] font-mono text-white mb-1">Inside the Workshop</h2>
              <p className="text-[12px] font-mono text-white/80">2:14 · Craft & Finishing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Gallery Grid */}
      <section className="pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <BehindTheScenesGallery />
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="pb-24 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto pt-16 text-center">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">Our Commitment</h2>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-700 leading-relaxed mb-8">
            We focus on consistency, finishing, and clean presentation — from material selection to final inspection.
            Every piece reflects our commitment to quality and attention to detail.
          </p>
          <Link
            href="/contact-us"
            className="inline-block px-6 py-3 text-[11px] font-mono uppercase tracking-[0.15em] text-white bg-black hover:bg-gray-800 transition-colors duration-300"
          >
            Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
