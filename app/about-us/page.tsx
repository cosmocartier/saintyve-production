"use client"

import { Navigation } from "@/components/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AboutUsPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 md:px-12">
        <div
          className={`text-center transition-all duration-1500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            className="text-[11px] md:text-[13px] font-normal tracking-[0.25em] uppercase text-[#0A0A0A] mb-6"
            style={{ letterSpacing: "0.25em" }}
          >
            About Saint Yve
          </h1>
          <p
            className="text-[32px] md:text-[56px] lg:text-[72px] font-light leading-[1.1] text-[#0A0A0A] max-w-5xl mx-auto"
            style={{ letterSpacing: "-0.02em" }}
          >
            The New Standard
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-[18px] md:text-[24px] lg:text-[28px] font-light leading-relaxed text-[#0A0A0A] text-center">
              Saint Yve is a next-generation luxury marketplace built to redefine how people shop high-end replicas.
              What started as a small community project has evolved into a premium, global destination for curated
              quality, fast delivery, and a customer experience that feels personal.
            </p>
          </div>

          <div
            className={`mt-16 md:mt-24 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-[14px] md:text-[16px] font-light leading-relaxed text-[#0A0A0A]/70 text-center max-w-2xl mx-auto">
              Our mission is simple: set a new standard in an industry that has been messy, unreliable, and unorganized
              for too long.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#0A0A0A]/10 my-12" />

      {/* Core Values Grid */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {/* Value 1 */}
            <div
              className={`transition-all duration-1000 delay-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h3
                className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
                style={{ letterSpacing: "0.2em" }}
              >
                Premium Quality, Every Time
              </h3>
              <p className="text-[14px] md:text-[16px] font-light leading-relaxed text-[#0A0A0A]/70">
                We work only with top-tier suppliers and verified factories to source pieces that meet our standards —
                clean stitching, correct materials, accurate details, and consistent QC. No randomness. No "maybe good,
                maybe bad." If a product doesn't pass our checks, it won't enter the store.
              </p>
            </div>

            {/* Value 2 */}
            <div
              className={`transition-all duration-1000 delay-800 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h3
                className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
                style={{ letterSpacing: "0.2em" }}
              >
                Fast, Reliable Fulfillment
              </h3>
              <p className="text-[14px] md:text-[16px] font-light leading-relaxed text-[#0A0A0A]/70">
                Unlike typical replica stores, Saint Yve operates with real e-commerce infrastructure. Outside peak
                seasons, orders move through a 1–3 day processing window. During high-volume periods, we scale through
                batch fulfillment to keep everything flowing. From order to delivery, you always stay updated.
              </p>
            </div>

            {/* Value 3 */}
            <div
              className={`transition-all duration-1000 delay-900 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h3
                className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
                style={{ letterSpacing: "0.2em" }}
              >
                A Customer-First Experience
              </h3>
              <p className="text-[14px] md:text-[16px] font-light leading-relaxed text-[#0A0A0A]/70">
                Saint Yve was built on service. We respond fast. We communicate clearly. We take responsibility. And
                if something goes wrong, we fix it. Our membership system adds another layer of care, offering priority
                lanes, credits, sourcing help, exclusive rewards, and a premium support experience.
              </p>
            </div>

            {/* Value 4 */}
            <div
              className={`transition-all duration-1000 delay-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h3
                className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
                style={{ letterSpacing: "0.2em" }}
              >
                Aesthetic at the Core
              </h3>
              <p className="text-[14px] md:text-[16px] font-light leading-relaxed text-[#0A0A0A]/70">
                We believe luxury is more than the product — it's the presentation. Every detail matters: studio-grade
                images, minimalist premium design, clean packaging, and elite membership cards. The entire brand is
                crafted to feel modern, sharp, and elevated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#0A0A0A]/10 my-12" />

      {/* Community Section */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-1100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h3
              className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
              style={{ letterSpacing: "0.2em" }}
            >
              Powered by Community
            </h3>
            <p className="text-[18px] md:text-[22px] font-light leading-relaxed text-[#0A0A0A]">
              Saint Yve didn't grow from ads. It grew from trust. From day-one customers sharing their experience.
              From people who love fashion and value a smooth process. This community shaped us — and still drives every
              decision we make.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#0A0A0A]/10 my-12" />

      {/* Future Vision */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-1200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h3
              className="text-[11px] md:text-[12px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A] mb-6"
              style={{ letterSpacing: "0.2em" }}
            >
              The Future
            </h3>
            <p className="text-[18px] md:text-[22px] font-light leading-relaxed text-[#0A0A0A]">
              We're building the most advanced platform in the replica industry — with real tech, real systems, and a
              vision to become the global #1 marketplace. Faster delivery. Better quality. More rewards. A cleaner,
              smoother experience for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-1300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p
              className="text-[36px] md:text-[56px] lg:text-[68px] font-light leading-[1.1] text-[#0A0A0A]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Saint Yve isn't just a shop.
              <br />
              It's the new standard.
            </p>
          </div>

          <div
            className={`mt-16 transition-all duration-1000 delay-1400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Link
              href="/products"
              className="inline-block bg-[#0A0A0A] text-white text-[11px] md:text-[12px] font-normal uppercase tracking-[0.2em] px-12 py-4 hover:bg-[#0A0A0A]/90 transition-all duration-300"
              style={{ letterSpacing: "0.2em" }}
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A0A0A]/10 px-6 md:px-12 py-16 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p
              className="text-[10px] md:text-[11px] font-normal tracking-[0.2em] uppercase text-[#0A0A0A]/50"
              style={{ letterSpacing: "0.2em" }}
            >
              © 2025 Saint Yve. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
