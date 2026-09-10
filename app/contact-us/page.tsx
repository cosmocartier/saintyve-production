import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us | Designerdrip",
  description:
    "Need help with an order, sizing, or membership? Reach out to the Designerdrip support team and we'll respond as quickly as possible.",
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-4 leading-tight">
            Contact
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl">
            Need help with an order, sizing, or membership? Reach out and we'll respond as quickly as possible.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Right: Support Information */}
            <div className="space-y-6">
              {/* Card 1: Support Hours */}
              <div className="bg-gray-50 border border-gray-100 p-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">Support Hours</h3>
                <p className="text-[13px] font-mono text-gray-700">Mon–Sat · Response usually within 24–48h</p>
              </div>

              {/* Card 2: Email */}
              <div className="bg-gray-50 border border-gray-100 p-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">Email</h3>
                <a
                  href="mailto:support@designerdrip.store"
                  className="text-[13px] font-mono text-black hover:text-gray-600 transition-colors underline"
                >
                  support@designerdrip.store
                </a>
              </div>

              {/* Card 3: Order Help */}
              <div className="bg-gray-50 border border-gray-100 p-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-4">Order Help</h3>
                <ul className="space-y-2">
                  <li className="text-[13px] font-mono text-gray-700">• Add your order number for faster support</li>
                  <li className="text-[13px] font-mono text-gray-700">• Tracking is emailed as soon as shipped</li>
                </ul>
              </div>

              {/* Card 4: FAQ */}
              <div className="bg-gray-50 border border-gray-100 p-6">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">FAQ</h3>
                <p className="text-[13px] font-mono text-gray-700 mb-4">
                  Find answers to common questions about shipping, returns, and sizing.
                </p>
                <Link
                  href="/faq"
                  className="inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-black border-b border-black hover:border-gray-400 hover:text-gray-600 transition-all"
                >
                  View FAQ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
