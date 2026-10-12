import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { LegalDocument } from "@/components/legal-document"

export const metadata: Metadata = {
  title: "Legal — Saint Yve",
  description:
    "Saint Yve privacy policy, return policy, terms and conditions of sale and terms and conditions of use.",
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <StaticNavigation />

      <main className="pt-24 md:pt-32">
        <div className="grid grid-cols-1 gap-12 px-6 pb-24 md:grid-cols-2 md:gap-16 md:px-12 md:pb-40 lg:px-16">
          <h1 className="text-[48px] font-bold uppercase leading-[0.9] tracking-tight md:text-[88px]">Legal</h1>
          <LegalDocument />
        </div>
      </main>

      <Footer />
    </div>
  )
}
