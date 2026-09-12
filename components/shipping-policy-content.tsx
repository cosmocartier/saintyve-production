"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const sections = [
  { id: "delivery-coverage", title: "Delivery Coverage" },
  { id: "free-shipping", title: "Free Shipping Threshold" },
  { id: "processing-times", title: "Processing Times" },
  { id: "delivery-times", title: "Estimated Delivery Times" },
  { id: "duties-taxes", title: "Duties & Taxes" },
  { id: "tracking", title: "Tracking & Notifications" },
  { id: "failed-deliveries", title: "Failed Deliveries" },
  { id: "returns-exchanges", title: "Returns & Exchanges" },
  { id: "damaged-items", title: "Damaged or Incorrect Items" },
  { id: "contact", title: "Contact" },
]

export function ShippingPolicyContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Mobile TOC Dropdown */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-[13px] font-mono text-black hover:bg-gray-100 transition-colors"
          >
            <span>Jump to section</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileMenuOpen && (
            <nav className="mt-2 bg-gray-50 border border-gray-200 rounded-sm p-4">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[13px] font-mono text-gray-700 hover:text-black transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Desktop Sticky TOC Sidebar */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <nav className="sticky top-32">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">Contents</h2>
            <ul className="space-y-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block text-[13px] font-mono text-gray-600 hover:text-black transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content Sections */}
        <div className="flex-1 max-w-3xl">
          <div className="space-y-12 lg:space-y-16">
            {/* Delivery Coverage */}
            <section id="delivery-coverage" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Delivery Coverage</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We ship worldwide to most countries and regions through trusted international logistics partners.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Europe</li>
                  <li>North America</li>
                  <li>Middle East</li>
                  <li>Asia</li>
                  <li>Australia</li>
                </ul>
                <p>
                  If your country is not supported during checkout, shipping is currently unavailable for that location.
                </p>
              </div>
            </section>

            {/* Free Shipping Threshold */}
            <section id="free-shipping" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Free Shipping Threshold</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>We offer free worldwide delivery on all orders above:</p>
                <p className="font-medium text-black">150€ minimum order value</p>
                <p>
                  Orders below this amount may incur a calculated shipping fee displayed at checkout.
                </p>
              </div>
            </section>

            {/* Processing Times */}
            <section id="processing-times" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Processing Times</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Orders are processed within:</p>
                <p className="font-medium text-black">1–3 business days</p>
                <p>This includes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>order verification</li>
                  <li>quality control</li>
                  <li>packaging</li>
                  <li>handover to courier</li>
                </ul>
                <p>Processing may take longer during:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>high-volume drops</li>
                  <li>holidays</li>
                  <li>limited releases</li>
                </ul>
              </div>
            </section>

            {/* Estimated Delivery Times */}
            <section id="delivery-times" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Estimated Delivery Times</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Delivery timelines depend on destination region.</p>
                <ul className="space-y-2">
                  <li><span className="font-medium text-black">Europe:</span> 5–9 business days</li>
                  <li><span className="font-medium text-black">Middle East:</span> 6–10 business days</li>
                  <li><span className="font-medium text-black">North America:</span> 7–12 business days</li>
                  <li><span className="font-medium text-black">Asia:</span> 7–12 business days</li>
                  <li><span className="font-medium text-black">Australia:</span> 8–14 business days</li>
                </ul>
                <p>These are estimates, not guarantees.</p>
              </div>
            </section>

            {/* Duties & Taxes */}
            <section id="duties-taxes" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Duties & Taxes</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Import duties, customs charges, or local taxes may apply depending on destination country.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>these fees are determined by local authorities</li>
                  <li>Saint Yve has no control over these charges</li>
                  <li>customers are responsible for any applicable import costs</li>
                </ul>
              </div>
            </section>

            {/* Tracking & Notifications */}
            <section id="tracking" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Tracking & Notifications</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Once shipped, customers receive:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>tracking number via email</li>
                  <li>shipment confirmation</li>
                  <li>delivery status updates</li>
                </ul>
                <p>Tracking activation may take 24–72h after dispatch.</p>
              </div>
            </section>

            {/* Failed Deliveries */}
            <section id="failed-deliveries" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Failed Deliveries</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If delivery fails due to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>incorrect address</li>
                  <li>missed delivery attempts</li>
                  <li>unclaimed parcels</li>
                </ul>
                <p>the shipment may be returned or disposed by the carrier.</p>
                <p>Re-shipping may require additional fees.</p>
              </div>
            </section>

            {/* Returns & Exchanges */}
            <section id="returns-exchanges" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Returns & Exchanges</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Returns are accepted within:</p>
                <p className="font-medium text-black">14 days of delivery</p>
                <p>Conditions:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>item unused</li>
                  <li>original packaging</li>
                  <li>tags intact</li>
                  <li>no visible wear or damage</li>
                </ul>
                <p>Return shipping costs may apply unless item is defective.</p>
                <p>Refunds are issued after inspection.</p>
              </div>
            </section>

            {/* Damaged or Incorrect Items */}
            <section id="damaged-items" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Damaged or Incorrect Items</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If you receive:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>damaged goods</li>
                  <li>incorrect item</li>
                  <li>missing components</li>
                </ul>
                <p>Contact support within 48 hours of delivery with:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>order number</li>
                  <li>photos</li>
                  <li>description</li>
                </ul>
                <p>We will resolve via replacement or refund.</p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Contact</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>For shipping or return inquiries:</p>
                <p>
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>
                </p>
                <p>Response time: 24–48 business hours.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
