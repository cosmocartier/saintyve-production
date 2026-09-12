import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { CookiePolicyContent } from "@/components/cookie-policy-content"

export const metadata: Metadata = {
  title: "Cookie Policy | Saint Yve",
  description: "How Saint Yve uses cookies and similar technologies to provide, improve, and protect our website.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/cookie-policy",
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-4 leading-tight">
            Cookie Policy
          </h1>
          <p className="text-[13px] font-mono text-gray-500 mb-6">Last updated: January 2025</p>
          <p className="text-[15px] font-mono text-gray-700 leading-relaxed max-w-3xl">
            This Cookie Policy explains how Saint Yve uses cookies and similar technologies to provide, improve, and
            protect our website.
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <CookiePolicyContent />

      <Footer />
    </div>
  )
}
