import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Our Mission | Designerdrip",
  description:
    "Quality over hype. Fair pricing without compromise. Designerdrip exists to deliver premium designer pieces through expert sourcing and unwavering standards.",
}

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[28px] lg:text-[36px] font-light tracking-tight text-black mb-6 leading-tight">
            Quality over everything.
          </h1>
          <p className="text-[15px] lg:text-[16px] font-mono text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Designerdrip exists to deliver premium designer pieces at the fairest possible price — through deep sourcing
            expertise, uncompromising quality control, and long-term trust with our community.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">Our Mission</h2>
          <div className="space-y-6">
            <p className="text-[15px] font-mono text-gray-700 leading-relaxed">
              The designer fashion market has a problem: inflated prices, questionable quality, and too much noise. Many
              retailers prioritize hype over substance, leaving customers paying premium prices for inconsistent
              products.
            </p>
            <p className="text-[15px] font-mono text-gray-700 leading-relaxed">
              We built Designerdrip to fix this. Through years of building relationships with trusted sources, strict
              quality checks, and transparent operations, we deliver designer pieces that meet our standards — and
              yours.
            </p>
            <p className="text-[15px] font-mono text-gray-700 leading-relaxed">
              Our goal is simple: give you access to premium fashion without the markup, the middlemen, or the
              compromises.
            </p>
          </div>
        </div>
      </section>

      {/* What We Stand For */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12 text-center">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Value 1 */}
            <div className="text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Quality Over Hype</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Every piece is evaluated on construction, materials, and design — not brand hype or marketing noise.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">
                Fair Pricing Without Compromises
              </h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                We source directly and operate lean, passing savings to you without sacrificing quality or service.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">
                Long-Term Trust Over Short-Term Profit
              </h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                We build relationships, not transactions. Every decision prioritizes customer trust and brand integrity.
              </p>
            </div>

            {/* Value 4 */}
            <div className="text-center">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">
                Community-First Mindset
              </h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                We listen, learn, and improve based on your feedback. This is as much your brand as it is ours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-8">How We Work</h2>
          <div className="space-y-8">
            {/* Process Step 1 */}
            <div>
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Careful Sourcing</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                We work with vetted suppliers who share our commitment to quality and authenticity. Every source is
                evaluated for consistency, reliability, and transparency.
              </p>
            </div>

            {/* Process Step 2 */}
            <div>
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Quality Checks</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Each piece is inspected for construction, materials, stitching, and finish. If it doesn't meet our
                standards, it doesn't reach you.
              </p>
            </div>

            {/* Process Step 3 */}
            <div>
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">
                Continuous Improvement
              </h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                We refine our process based on what works, what doesn't, and what our customers tell us. Good enough is
                never the goal.
              </p>
            </div>

            {/* Process Step 4 */}
            <div>
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Feedback Loop</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Your experience shapes how we operate. We listen to feedback, address issues quickly, and use insights
                to improve every part of the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Promise */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-8">The Promise</h2>
          <p className="text-[15px] lg:text-[16px] font-mono text-gray-700 leading-relaxed mb-6">
            When you buy from Designerdrip, you can expect consistent quality, fair pricing, and honest communication.
            No gimmicks. No compromises. Just premium pieces curated with care.
          </p>
          <p className="text-[15px] lg:text-[16px] font-mono text-gray-700 leading-relaxed mb-10">
            We're not here for quick wins. We're building a brand that earns your trust, order after order, year after
            year.
          </p>

          {/* Subtle CTA */}
          <Link
            href="/new-arrivals"
            className="inline-block text-[12px] font-mono uppercase tracking-[0.15em] text-black border-b border-black hover:border-gray-400 hover:text-gray-600 transition-all duration-300"
          >
            → Explore the collection
          </Link>
        </div>
      </section>
    </div>
  )
}
