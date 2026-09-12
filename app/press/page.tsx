import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { MENTIONS, PRESS_ASSETS, BRAND_FACTS } from "@/lib/press/press-data"

export const metadata: Metadata = {
  title: "Press | Saint Yve",
  description: "Press resources, brand facts, and official assets for media inquiries about Saint Yve.",
}

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-6 leading-tight">Press</h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mb-8">
            Press resources, brand facts, and official assets.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact-us?topic=press">
              <Button className="bg-black text-white hover:bg-zinc-800 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                Press inquiry
              </Button>
            </Link>
            <a href="#press-kit">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-gray-50 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em] bg-transparent"
              >
                Download press kit
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About Saint Yve (Boilerplate) */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 lg:p-10 bg-white border-gray-200">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">About</h2>
            <div className="space-y-4">
              <p className="text-[14px] font-mono text-gray-700 leading-relaxed">
                Saint Yve is a curated destination for high-standard pieces, focused on clean presentation, fast
                processing, and consistent quality checks.
              </p>
              <p className="text-[14px] font-mono text-gray-700 leading-relaxed">
                We operate with a small, detail-driven team across product, logistics, and customer experience.
              </p>
              <p className="text-[14px] font-mono text-gray-700 leading-relaxed">
                Our goal is to deliver premium fashion without the markup, the middlemen, or the compromises.
              </p>

              <Separator className="my-6" />

              <p className="text-[12px] font-mono text-gray-500 italic">
                For interviews, imagery, or official statements, contact us via Press Inquiry.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Press Mentions */}
      <section className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-8">Press Mentions</h2>

          {/* Grid of mention cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {MENTIONS.map((mention) => (
              <Card key={mention.id} className="p-6 bg-white border-gray-200 hover:border-gray-400 transition-colors">
                <Badge variant="secondary" className="text-[10px] font-mono mb-3">
                  {mention.publication}
                </Badge>
                <h3 className="text-[14px] font-mono font-medium text-black mb-2 leading-snug">{mention.headline}</h3>
                <p className="text-[12px] font-mono text-gray-500 mb-4">{mention.date}</p>

                <Button
                  variant="ghost"
                  disabled={!mention.link}
                  className="text-[11px] font-mono uppercase tracking-[0.1em] px-0 hover:bg-transparent disabled:opacity-40"
                >
                  {mention.link ? "Read →" : "Coming soon"}
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-[12px] font-mono text-gray-500 text-center">
            Mentions will be listed here as they go live.
          </p>
        </div>
      </section>

      {/* Press Kit (Downloadable Assets) */}
      <section id="press-kit" className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12">Press Kit</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Assets list */}
            <div>
              <h3 className="text-[13px] font-mono font-medium text-black mb-6">Assets</h3>
              <div className="space-y-4">
                {PRESS_ASSETS.map((asset) => (
                  <Card key={asset.id} className="p-5 bg-white border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-[13px] font-mono font-medium text-black mb-1">{asset.name}</h4>
                        <p className="text-[11px] font-mono text-gray-500">{asset.description}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!asset.downloadUrl}
                        className="ml-4 bg-black text-white hover:bg-gray-800 text-[10px] font-mono uppercase tracking-[0.1em] disabled:opacity-40"
                      >
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              {/* TODO comment */}
              <p className="text-[11px] font-mono text-gray-400 mt-6">
                {/* TODO: Wire real download URLs for press assets */}
              </p>
            </div>

            {/* Right: Usage notes */}
            <div>
              <h3 className="text-[13px] font-mono font-medium text-black mb-6">Usage Guidelines</h3>
              <Card className="p-6 bg-white border-gray-200">
                <ul className="space-y-4">
                  <li className="text-[13px] font-mono text-gray-700">
                    <span className="text-black font-medium">•</span> Use official logos without modification.
                  </li>
                  <li className="text-[13px] font-mono text-gray-700">
                    <span className="text-black font-medium">•</span> Maintain clear space and contrast.
                  </li>
                  <li className="text-[13px] font-mono text-gray-700">
                    <span className="text-black font-medium">•</span> For approvals, contact press.
                  </li>
                </ul>

                <Separator className="my-6" />

                <p className="text-[12px] font-mono text-gray-500">
                  Misuse of assets or unauthorized alterations may result in a takedown request.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Facts */}
      <section className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12 text-center">Brand Facts</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {BRAND_FACTS.map((fact, idx) => (
              <Card key={idx} className="p-6 bg-gray-50 border-gray-200 text-center">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-gray-500 mb-2">{fact.label}</h3>
                <p className="text-[14px] font-mono font-medium text-black">{fact.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contacts (Press Inquiry CTA) */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <Card className="p-10 lg:p-12 bg-black text-white border-black text-center">
            <h2 className="text-[20px] font-light tracking-tight mb-4">Press inquiry</h2>
            <p className="text-[13px] font-mono text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              For interviews, statements, partnerships, or media requests, reach out here.
            </p>

            <Link href="/contact-us?topic=press">
              <Button className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-[12px] font-mono uppercase tracking-[0.1em]">
                Contact Press
              </Button>
            </Link>

            {/* Optional: Uncomment if press email exists */}
            {/* <Separator className="my-8 bg-gray-700" />
            <p className="text-[12px] font-mono text-gray-400">
              Direct:{" "}
              <a href="mailto:press@designerdrip.store" className="text-white underline hover:text-gray-300">
                press@designerdrip.store
              </a>
            </p> */}
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
