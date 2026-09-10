"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SizeGuideContent } from "@/components/size-guide/size-guide-content"

export default function SizeGuideClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-4 leading-tight">
            Size Guide
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mb-8">
            Find your best fit using measurements and conversions. If you're unsure, contact support.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/contact-us?topic=sizing"
              className="inline-flex items-center justify-center px-6 py-3 text-[11px] font-mono uppercase tracking-[0.15em] bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={() => {
                document.getElementById("category-tabs")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="inline-flex items-center justify-center px-6 py-3 text-[11px] font-mono uppercase tracking-[0.15em] border border-black text-black hover:bg-gray-50 transition-colors"
            >
              Jump to category
            </button>
          </div>
        </div>
      </section>

      {/* Size Guide Content with Tabs */}
      <SizeGuideContent />

      {/* Universal "How to Measure" Section */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12 text-center">
            How to Measure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 p-6 text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Measure in CM</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                All measurements shown in centimeters for consistency and accuracy.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-6 text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Use a Soft Tape</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                A flexible measuring tape ensures accurate body and item measurements.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-6 text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">
                Compare to Similar Items
              </h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Measure a piece you own that fits well and compare to our size charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="py-16 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[15px] lg:text-[16px] font-mono text-black mb-4 leading-relaxed">
            Still unsure? Send us your height + weight + preferred fit.
          </h2>
          <a
            href="/contact-us?topic=sizing"
            className="inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-black border-b border-black hover:border-gray-400 hover:text-gray-600 transition-all"
          >
            Get Sizing Help →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
