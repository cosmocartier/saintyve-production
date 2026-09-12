import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { ReturnPolicyContent } from "@/components/return-policy-content"

export const metadata: Metadata = {
  title: "Return Policy | Saint Yve",
  description: "14-day returns, structured refund process, and exchanges. Read the official Saint Yve return and refund policy.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/return-policy",
  },
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-6 leading-tight">
            Returns & Refund Policy
          </h1>
          <p className="text-[15px] font-mono text-gray-700 leading-relaxed max-w-3xl">
            We stand behind the quality and presentation of every Saint Yve piece.
            If something isn't right, our return process is designed to be clear, fair, and structured.
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <ReturnPolicyContent />

      <Footer />
    </div>
  )
}
