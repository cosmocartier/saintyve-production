"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const sections = [
  { id: "return-eligibility", title: "Return Eligibility" },
  { id: "return-window", title: "14-Day Return Window" },
  { id: "condition-requirements", title: "Condition Requirements" },
  { id: "non-returnable", title: "Non-Returnable Items" },
  { id: "return-process", title: "Return Process" },
  { id: "refunds", title: "Refunds" },
  { id: "exchanges", title: "Exchanges" },
  { id: "return-shipping", title: "Return Shipping Costs" },
  { id: "damaged-orders", title: "Damaged or Incorrect Orders" },
  { id: "late-refunds", title: "Late or Missing Refunds" },
  { id: "contact", title: "Contact" },
]

export function ReturnPolicyContent() {
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
            {/* Return Eligibility */}
            <section id="return-eligibility" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Return Eligibility</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Customers may request a return for eligible items within the defined return window.
                </p>
                <p>Returns are accepted for:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>incorrect sizing</li>
                  <li>change of preference</li>
                  <li>product dissatisfaction</li>
                </ul>
                <p>All returns must meet condition requirements.</p>
              </div>
            </section>

            {/* 14-Day Return Window */}
            <section id="return-window" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">14-Day Return Window</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Return requests must be initiated within:</p>
                <p className="font-medium text-black">14 days of delivery</p>
                <p>Requests submitted after this period may not be approved.</p>
              </div>
            </section>

            {/* Condition Requirements */}
            <section id="condition-requirements" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Condition Requirements</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Returned items must be:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>unused</li>
                  <li>unworn</li>
                  <li>in original condition</li>
                  <li>with original packaging</li>
                  <li>with all tags attached</li>
                </ul>
                <p>Items showing signs of use, wear, or damage may be rejected.</p>
              </div>
            </section>

            {/* Non-Returnable Items */}
            <section id="non-returnable" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Non-Returnable Items</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>The following items are not eligible for return:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>worn items</li>
                  <li>damaged by customer handling</li>
                  <li>items without original packaging</li>
                  <li>hygiene-sensitive products (if applicable)</li>
                  <li>final sale / limited drop pieces</li>
                </ul>
              </div>
            </section>

            {/* Return Process */}
            <section id="return-process" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Return Process</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Submit return request via support email</p>
                <p>Provide:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>order number</li>
                  <li>reason for return</li>
                  <li>product photos (if required)</li>
                </ul>
                <p>Wait for return approval</p>
                <p>Receive return instructions</p>
                <p>Ship item back to designated address</p>
                <p className="font-medium text-black">Returns sent without approval may not be accepted.</p>
              </div>
            </section>

            {/* Refunds */}
            <section id="refunds" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Refunds</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Once a return is received and inspected:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>refunds are issued to the original payment method</li>
                  <li>processing time: 5–10 business days</li>
                  <li>notification sent once refund is completed</li>
                </ul>
                <p>Original shipping costs are non-refundable unless the item is defective.</p>
              </div>
            </section>

            {/* Exchanges */}
            <section id="exchanges" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Exchanges</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Exchanges are possible for:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>sizing issues</li>
                  <li>replacement items</li>
                  <li>product defects</li>
                </ul>
                <p>Subject to availability.</p>
                <p>If unavailable:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>refund or store credit offered.</li>
                </ul>
              </div>
            </section>

            {/* Return Shipping Costs */}
            <section id="return-shipping" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Return Shipping Costs</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Customers are responsible for return shipping costs unless:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>item is defective</li>
                  <li>wrong item delivered</li>
                  <li>item damaged during delivery</li>
                </ul>
                <p>Shipping fees are non-refundable.</p>
              </div>
            </section>

            {/* Damaged or Incorrect Orders */}
            <section id="damaged-orders" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Damaged or Incorrect Orders</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If your order arrives:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>damaged</li>
                  <li>incomplete</li>
                  <li>incorrect</li>
                </ul>
                <p>Contact us within 48 hours of delivery.</p>
                <p>Provide:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>photos</li>
                  <li>order number</li>
                  <li>issue description</li>
                </ul>
                <p>We will arrange replacement or refund.</p>
              </div>
            </section>

            {/* Late or Missing Refunds */}
            <section id="late-refunds" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Late or Missing Refunds</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If refund has not been received:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Check bank/payment provider</li>
                  <li>Allow processing time</li>
                  <li>Contact support if delay continues</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Contact</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>For return inquiries:</p>
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
