import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { PrivacyPolicyContent } from "@/components/privacy-policy-content"

export const metadata: Metadata = {
  title: "Privacy Policy | Saint Yve",
  description: "Saint Yve Privacy Policy covering data collection, usage, security, and your rights under GDPR.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/privacy-policy",
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[13px] font-mono text-gray-500 mb-6">Last updated: December 2025</p>
          <p className="text-[15px] font-mono text-gray-700 leading-relaxed max-w-3xl">
            Your privacy is important to us. This Privacy Policy explains how Saint Yve collects, uses, and protects
            your personal data when you use our website and services.
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <PrivacyPolicyContent />

      <Footer />
    </div>
  )
}
