"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const sections = [
  { id: "agreement", title: "Agreement to Terms" },
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Account & Security" },
  { id: "orders", title: "Orders" },
  { id: "pricing", title: "Pricing & Payment" },
  { id: "shipping", title: "Shipping & Delivery" },
  { id: "returns", title: "Returns & Refunds" },
  { id: "prohibited", title: "Prohibited Uses" },
  { id: "intellectual", title: "Intellectual Property" },
  { id: "limitation", title: "Limitation of Liability" },
  { id: "disputes", title: "Disputes & Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
]

export function TermsOfServiceContent() {
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
            {/* Agreement to Terms */}
            <section id="agreement" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Agreement to Terms</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  By accessing or using Designerdrip ("we," "us," "our"), you agree to be bound by these Terms of
                  Service. If you do not agree, please do not use our website or services.
                </p>
                <p>
                  We reserve the right to modify these Terms at any time. Continued use of our platform after changes
                  constitutes acceptance of the revised Terms.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section id="eligibility" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Eligibility</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  You must be at least 18 years old (or the age of majority in your jurisdiction) to make purchases or
                  create an account. By using Designerdrip, you represent that you meet this requirement.
                </p>
                <p>
                  If you are under 18, you may use our services only with the involvement and permission of a parent or
                  guardian.
                </p>
              </div>
            </section>

            {/* Account & Security */}
            <section id="account" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Account & Security</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all
                  activities that occur under your account.
                </p>
                <p>
                  Notify us immediately at{" "}
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>{" "}
                  if you suspect unauthorized access to your account.
                </p>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent
                  activity.
                </p>
              </div>
            </section>

            {/* Orders */}
            <section id="orders" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Orders</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  When you place an order, you will receive a confirmation email. This email confirms receipt of your
                  order but does not constitute acceptance. We reserve the right to refuse or cancel orders at our
                  discretion.
                </p>
                <p>
                  All orders are subject to product availability. If an item is unavailable, we will notify you and
                  offer a refund or alternative.
                </p>
                <p>
                  You are responsible for providing accurate shipping and billing information. Errors may result in
                  delays or additional charges.
                </p>
              </div>
            </section>

            {/* Pricing & Payment */}
            <section id="pricing" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Pricing & Payment</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  All prices are displayed in your selected currency and include applicable taxes unless otherwise
                  stated. Prices are subject to change without notice.
                </p>
                <p>
                  We accept major credit cards, debit cards, and other payment methods as displayed at checkout. Payment
                  must be received before your order is processed.
                </p>
                <p>In case of pricing errors, we reserve the right to cancel orders and issue a full refund.</p>
              </div>
            </section>

            {/* Shipping & Delivery */}
            <section id="shipping" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Shipping & Delivery</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We ship to select countries as indicated at checkout. Delivery times are estimates and may vary due to
                  customs, holidays, or unforeseen circumstances.
                </p>
                <p>
                  Once your order is shipped, you will receive a tracking number via email. You are responsible for
                  monitoring the delivery.
                </p>
                <p>
                  Designerdrip is not responsible for lost, stolen, or delayed shipments once the carrier confirms
                  delivery. For delivery issues, contact the carrier directly.
                </p>
              </div>
            </section>

            {/* Returns & Refunds */}
            <section id="returns" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Returns & Refunds</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We accept returns within 14 days of delivery for items in original, unworn condition with all tags
                  attached. Sale items and final sale products are not eligible for return.
                </p>
                <p>
                  To initiate a return, contact{" "}
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>{" "}
                  with your order number and reason for return. We will provide return instructions.
                </p>
                <p>
                  Refunds will be processed to your original payment method within 5-10 business days after we receive
                  and inspect the returned item. Shipping costs are non-refundable unless the return is due to our
                  error.
                </p>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section id="prohibited" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Prohibited Uses</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Use our platform for illegal purposes or to violate any laws</li>
                  <li>Engage in fraudulent activity or provide false information</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Resell or redistribute products purchased from Designerdrip without authorization</li>
                  <li>Use automated tools (bots, scrapers) to access or interact with our website</li>
                </ul>
                <p>
                  Violation of these prohibitions may result in account suspension, order cancellation, and legal
                  action.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">
                Intellectual Property
              </h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  All content on Designerdrip, including text, images, logos, and design, is owned by Designerdrip or
                  our licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, or create derivative works from any content on our website
                  without express written permission.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="limitation" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Designerdrip provides products and services "as is" without warranties of any kind, express or
                  implied.
                </p>
                <p>
                  To the fullest extent permitted by law, Designerdrip shall not be liable for any indirect, incidental,
                  special, or consequential damages arising from your use of our website or products.
                </p>
                <p>
                  Our total liability for any claim related to your use of Designerdrip shall not exceed the amount you
                  paid for the relevant product or service.
                </p>
              </div>
            </section>

            {/* Disputes & Governing Law */}
            <section id="disputes" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">
                Disputes & Governing Law
              </h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these
                  Terms or your use of Designerdrip shall be resolved exclusively in the courts of Dubai, UAE.
                </p>
                <p>
                  Before pursuing legal action, we encourage you to contact us at{" "}
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>{" "}
                  to resolve any issues amicably.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Changes to Terms</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We may update these Terms from time to time. The latest version will always be available on this page,
                  and the "Last updated" date will be revised accordingly.
                </p>
                <p>
                  Significant changes will be communicated via email or a prominent notice on our website. Continued use
                  of Designerdrip after changes constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Contact</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If you have questions about these Terms of Service, please contact us at:</p>
                <div className="space-y-1">
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:support@designerdrip.store"
                      className="underline hover:text-black transition-colors"
                    >
                      support@designerdrip.store
                    </a>
                  </p>
                  <p>Address: Designerdrip, Dubai Silicon Oasis, UAE</p>
                  <p>
                    Website:{" "}
                    <a href="https://www.designerdrip.store" className="underline hover:text-black transition-colors">
                      www.designerdrip.store
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
