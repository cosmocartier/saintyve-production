import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Legal — Saint Yve",
  description: "Legal information about Saint Yve, including company name, owner and business address.",
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <StaticNavigation />

      <main className="pt-24 md:pt-32">
        <section className="px-6 md:px-12 lg:px-16 pb-24 md:pb-40">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[36px] md:text-[56px] font-sans font-light tracking-tight leading-[0.95]">
              Legal
            </h1>

            <dl className="mt-16 md:mt-24 max-w-3xl border-t border-black">
              <div className="grid grid-cols-1 gap-3 border-b border-black py-8 md:grid-cols-[1fr_2fr] md:gap-12 md:py-10">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Company Name</dt>
                <dd className="text-[15px] font-sans leading-relaxed">Saint Yve</dd>
              </div>

              <div className="grid grid-cols-1 gap-3 border-b border-black py-8 md:grid-cols-[1fr_2fr] md:gap-12 md:py-10">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Owner</dt>
                <dd className="text-[15px] font-sans leading-relaxed">Wladislav Weber</dd>
              </div>

              <div className="grid grid-cols-1 gap-3 border-b border-black py-8 md:grid-cols-[1fr_2fr] md:gap-12 md:py-10">
                <dt className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Business Address</dt>
                <dd>
                  <address className="text-[15px] font-sans not-italic leading-relaxed">
                    Schweinheimer Straße 28
                    <br />
                    63743 Aschaffenburg
                    <br />
                    Germany
                  </address>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
