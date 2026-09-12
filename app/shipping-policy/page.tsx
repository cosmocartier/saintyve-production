import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { ShippingPolicyContent } from "@/components/shipping-policy-content"

export const metadata: Metadata = {
  title: "Shipping Policy | Saint Yve",
  description: "Worldwide delivery, free shipping over 150€, and 14-day returns. Read the official Saint Yve shipping and logistics policy.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/shipping-policy",
  },
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-6 leading-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-[15px] font-mono text-gray-700 leading-relaxed max-w-3xl">
            We deliver Saint Yve pieces worldwide with precision, care, and speed.
            Below you'll find everything related to shipping timelines, delivery coverage, returns, and logistics.
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <ShippingPolicyContent />

      <Footer />
    </div>
  )
}
