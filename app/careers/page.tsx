import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { POSITIONS } from "@/lib/careers/positions"

export const metadata: Metadata = {
  title: "Careers | Saint Yve",
  description: "Join Saint Yve — operations, support, product, growth, and vendor partnerships.",
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-6 leading-tight">
            Careers
          </h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed mb-6 max-w-2xl">
            We're building a high-standard operation across product, logistics, and customer experience.
          </p>

          {/* Two micro bullets */}
          <ul className="space-y-2 mb-8">
            <li className="text-[13px] font-mono text-gray-500">• Remote-friendly roles (where possible)</li>
            <li className="text-[13px] font-mono text-gray-500">• High standards, fast execution</li>
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#positions">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                Apply now
              </Button>
            </a>
            <a href="#vendors">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-gray-50 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em] bg-transparent"
              >
                Vendor inquiry
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Culture / What We Value */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12 text-center">
            What We Value
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <Card className="p-6 bg-white border-gray-200">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Precision</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Details matter — from product pages to packaging.
              </p>
            </Card>

            {/* Value 2 */}
            <Card className="p-6 bg-white border-gray-200">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Speed with Standards</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Move fast, but never compromise on quality checks.
              </p>
            </Card>

            {/* Value 3 */}
            <Card className="p-6 bg-white border-gray-200">
              <h3 className="text-[13px] font-mono font-medium tracking-wide text-black mb-3">Customer Experience</h3>
              <p className="text-[13px] font-mono text-gray-600 leading-relaxed">
                Support should feel like concierge service.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12">Open Positions</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {POSITIONS.map((position) => (
              <AccordionItem key={position.id} value={position.id} className="border border-gray-200 bg-white">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left gap-3">
                    <div className="flex-1">
                      <h3 className="text-[14px] font-mono font-medium text-black mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-[10px] font-mono bg-gray-100">
                          {position.department}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2">
                  <p className="text-[13px] font-mono text-gray-600 mb-6">{position.summary}</p>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">
                      Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {position.responsibilities.map((item, idx) => (
                        <li key={idx} className="text-[13px] font-mono text-gray-700">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {position.requirements.map((item, idx) => (
                        <li key={idx} className="text-[13px] font-mono text-gray-700">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nice-to-haves */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-3">Nice-to-haves</h4>
                    <ul className="space-y-2">
                      {position.niceToHaves.map((item, idx) => (
                        <li key={idx} className="text-[13px] font-mono text-gray-500">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply CTA */}
                  <Link href={`/contact-us?topic=careers&role=${position.id}`}>
                    <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                      Apply for this role
                    </Button>
                  </Link>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-12 text-center">
            Hiring Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Step 1 */}
            <Card className="p-6 bg-white border-gray-200 text-center">
              <div className="text-[24px] font-light text-black mb-3">1</div>
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Apply</h3>
              <p className="text-[13px] font-mono text-gray-600">Short form</p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 bg-white border-gray-200 text-center">
              <div className="text-[24px] font-light text-black mb-3">2</div>
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Quick screening</h3>
              <p className="text-[13px] font-mono text-gray-600">15–30 min call</p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 bg-white border-gray-200 text-center">
              <div className="text-[24px] font-light text-black mb-3">3</div>
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Paid test / trial task</h3>
              <p className="text-[13px] font-mono text-gray-600">Role dependent</p>
            </Card>
          </div>

          <p className="text-[13px] font-mono text-gray-500 text-center">
            We hire for output and reliability — not long resumes.
          </p>
        </div>
      </section>

      {/* Vendors / Partners Section */}
      <section id="vendors" className="py-20 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Vendors Hero */}
          <div className="mb-16 text-center">
            <h2 className="text-[28px] lg:text-[32px] font-light tracking-tight text-black mb-4">Vendors & Partners</h2>
            <p className="text-[14px] font-mono text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We work with a small set of specialized partners across production, logistics, packaging, and creative.
            </p>
          </div>

          {/* Vendor Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Production / Manufacturing</h3>
              <p className="text-[12px] font-mono text-gray-600">Garments, accessories, footwear</p>
            </Card>

            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Quality Control</h3>
              <p className="text-[12px] font-mono text-gray-600">Inspection, testing, certification</p>
            </Card>

            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Logistics & Fulfillment</h3>
              <p className="text-[12px] font-mono text-gray-600">Warehousing, shipping, returns</p>
            </Card>

            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Packaging & Inserts</h3>
              <p className="text-[12px] font-mono text-gray-600">Boxes, tissue, branded materials</p>
            </Card>

            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Creative Production</h3>
              <p className="text-[12px] font-mono text-gray-600">Photography, video, editing</p>
            </Card>

            <Card className="p-6 bg-gray-50 border-gray-200">
              <h3 className="text-[13px] font-mono font-medium text-black mb-2">Technology & Automation</h3>
              <p className="text-[12px] font-mono text-gray-600">Software, APIs, integrations</p>
            </Card>
          </div>

          {/* Vendor Inquiry CTA Card */}
          <Card className="p-8 lg:p-12 bg-black text-white border-black">
            <h3 className="text-[18px] font-light tracking-tight mb-4">Become a vendor</h3>
            <p className="text-[13px] font-mono text-gray-300 mb-6">What to include in your inquiry:</p>
            <ul className="space-y-2 mb-8">
              <li className="text-[13px] font-mono text-gray-300">• Company name + location</li>
              <li className="text-[13px] font-mono text-gray-300">• Capabilities + lead times</li>
              <li className="text-[13px] font-mono text-gray-300">• Minimum order quantities (if any)</li>
              <li className="text-[13px] font-mono text-gray-300">• Portfolio / references</li>
            </ul>

            <Link href="/contact-us?topic=vendor">
              <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                Submit vendor inquiry
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
