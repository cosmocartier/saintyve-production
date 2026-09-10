import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { TermsOfServiceContent } from "@/components/terms-of-service-content"

export const metadata: Metadata = {
  title: "Terms of Service | Designerdrip",
  description: "Designerdrip Terms of Service covering orders, payments, shipping, returns, and platform usage.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/terms-of-service",
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-[13px] font-mono text-gray-500 mb-6">Last updated: January 2025</p>
          <p className="text-[15px] font-mono text-gray-700 leading-relaxed max-w-3xl">
            These Terms govern your use of Designerdrip and purchases made through our website.
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <TermsOfServiceContent />

      <Footer />
    </div>
  )
}
