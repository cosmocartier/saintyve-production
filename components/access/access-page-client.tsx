"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Package, Lock, LayoutGrid } from "lucide-react"
import { AccessModal } from "./access-modal"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function AccessPageClient() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#111111] font-sans">
      {/* ── Minimal Header ── */}
      <header className="flex items-center justify-center py-8 px-6">
        <img
          src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/7820388d-bd73-4dd4-4349-c6ba093b5600/w=800"
          alt="SAINT YVE"
          className="h-4 w-auto"
        />
      </header>

      {/* ── Hero Section ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <p
          className="text-[10px] uppercase tracking-[0.3em] text-[#999690] mb-8"
          style={{ animation: "slideDown 0.7s ease forwards" }}
        >
          Private Platform
        </p>

        <h1
          className="font-sans text-5xl md:text-6xl lg:text-7xl font-normal text-[#111111] leading-tight tracking-tight text-balance mb-6"
          style={{ animation: "slideUp 0.8s ease 0.1s both" }}
        >
          Curated Luxury Access
        </h1>

        <p
          className="text-[#888480] text-sm md:text-base leading-relaxed max-w-[460px] mb-10 text-pretty"
          style={{ animation: "slideUp 0.8s ease 0.2s both" }}
        >
          Saint Yve operates as a private sourcing platform. Inventory is
          shared exclusively via our private line.
        </p>

        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: "slideUp 0.8s ease 0.3s both" }}
        >
          <Button
            onClick={() => setModalOpen(true)}
            className="h-12 px-10 rounded-md bg-[#111111] text-white hover:bg-[#111111]/80 text-[11px] uppercase tracking-[0.2em] font-sans font-normal transition-all duration-200"
          >
            Request Access
          </Button>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[11px] text-[#999690] hover:text-[#111111] transition-colors tracking-wide underline underline-offset-4 font-normal"
          >
            Returning client? Enter with code
          </button>
        </div>
      </section>

      {/* ── Editorial Visual Section ── */}
      <RevealSection className="w-full max-w-2xl mx-auto px-6 mb-24 md:mb-32">
        <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
          <Image
            src="/access/editorial-hero.jpg"
            alt="Curated seasonal selection"
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute bottom-6 left-6">
            <p className="text-white/80 text-[10px] uppercase tracking-[0.2em]">
              Seasonal Selection · Private Distribution
            </p>
          </div>
        </div>
      </RevealSection>

      {/* ── How It Works Section ── */}
      <RevealSection className="w-full max-w-3xl mx-auto px-6 mb-24 md:mb-32">
        <div className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#999690] mb-4">Process</p>
          <h2 className="font-sans text-3xl md:text-4xl font-normal text-[#111111] tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {[
            {
              icon: <Package strokeWidth={1} className="w-5 h-5 text-[#888480]" />,
              title: "Curated Inventory",
              body: "Each piece is selected through long-term sourcing relationships.",
            },
            {
              icon: <Lock strokeWidth={1} className="w-5 h-5 text-[#888480]" />,
              title: "Private Access",
              body: "Availability and pricing are shared through our private line.",
            },
            {
              icon: <LayoutGrid strokeWidth={1} className="w-5 h-5 text-[#888480]" />,
              title: "Controlled Distribution",
              body: "We operate on limited client intake per release.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-4">
              <div className="w-10 h-10 border border-[#D5D3CE] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-sm font-normal uppercase tracking-[0.15em] text-[#111111]">
                {item.title}
              </h3>
              <p className="text-[13px] text-[#888480] leading-relaxed max-w-[220px]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── Divider ── */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-24 md:mb-32">
        <div className="h-px bg-[#E2E0DC]" />
      </div>

      {/* ── Social Proof Section ── */}
      <RevealSection className="w-full max-w-3xl mx-auto px-6 mb-24 md:mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { src: "/access/social-proof-1.jpg", alt: "Luxury packaging" },
            { src: "/access/social-proof-2.jpg", alt: "Product detail" },
            { src: "/access/social-proof-3.jpg", alt: "Delivery unboxing" },
            { src: "/access/social-proof-4.jpg", alt: "Client selection" },
          ].map((img) => (
            <div key={img.src} className="relative aspect-square overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </div>
          ))}
        </div>
        <p className="text-center text-[12px] text-[#888480] tracking-wide">
          Trusted by a growing private client base across Europe.
        </p>
      </RevealSection>

      {/* ── Scarcity Block ── */}
      <RevealSection className="w-full max-w-xl mx-auto px-6 mb-24 md:mb-32">
        <div className="h-px bg-[#E2E0DC] mb-10" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#999690] mb-5">
            Limited Intake
          </p>
          <p className="text-[14px] text-[#888480] leading-relaxed max-w-[420px] mx-auto">
            We onboard a limited number of new clients each week to maintain
            quality and service standards.
          </p>
        </div>
        <div className="h-px bg-[#E2E0DC] mt-10" />
      </RevealSection>

      {/* ── Final CTA Section ── */}
      <RevealSection className="w-full text-center px-6 pb-24 md:pb-32">
        <h2 className="font-sans text-3xl md:text-4xl font-normal text-[#111111] tracking-tight mb-8 text-balance">
          Access the Current Selection
        </h2>
        <Button
          onClick={() => setModalOpen(true)}
          className="h-12 px-10 rounded-md bg-[#111111] text-white hover:bg-[#111111]/80 text-[11px] uppercase tracking-[0.2em] font-sans font-normal transition-all duration-200"
        >
          Open Private Line
        </Button>
      </RevealSection>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2E0DC] py-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/7820388d-bd73-4dd4-4349-c6ba093b5600/w=800"
            alt="SAINT YVE"
            className="h-3.5 w-auto opacity-40"
          />
          <p className="text-[10px] text-[#BCBAB5] tracking-[0.2em] uppercase">
            © 2025 Saint Yve. All rights reserved.
          </p>
        </div>
      </footer>

      <AccessModal open={modalOpen} onOpenChange={setModalOpen} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
