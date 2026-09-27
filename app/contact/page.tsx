import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { ContactPageForm } from "@/components/contact-page-form"

export const metadata: Metadata = {
  title: "Contact — Saint Yve",
  description: "Get in touch with Saint Yve regarding orders, membership, or general inquiries.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <StaticNavigation />

      <main className="pt-24 md:pt-32">
        {/* Hero / introduction */}
        <section className="px-6 md:px-12 lg:px-16 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[36px] md:text-[56px] font-sans font-light tracking-tight leading-[0.95]">
              Contact
            </h1>
            <p className="mt-6 text-[13px] md:text-[14px] font-sans text-zinc-500 leading-relaxed max-w-sm">
              We would love to hear from you.
            </p>
          </div>
        </section>

        {/* Info + form */}
        <section className="px-6 md:px-12 lg:px-16 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 md:gap-24">
            {/* Left: contact information */}
            <div className="space-y-16">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 mb-3">
                  General Inquiries
                </h2>
                <a
                  href="mailto:contact@saintyve.com"
                  className="text-[15px] font-sans text-black underline decoration-zinc-300 hover:decoration-black transition-colors break-all"
                >
                  contact@saintyve.com
                </a>
              </div>

              <div>
                <h2 className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 mb-3">Stores</h2>
                <a
                  href="/stores"
                  className="block text-[15px] font-sans text-black underline decoration-zinc-300 hover:decoration-black transition-colors"
                >
                  Berlin
                </a>
                <p className="mt-2 text-[13px] font-sans text-zinc-500 leading-relaxed">
                  Torstraße 1, 10119 Berlin, Germany
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div>
              <ContactPageForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
