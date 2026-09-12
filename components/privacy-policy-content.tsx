"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const sections = [
  { id: "who-we-are", title: "Who we are" },
  { id: "what-data", title: "What data we collect" },
  { id: "how-we-use", title: "How we use your data" },
  { id: "cookies", title: "Cookies & analytics" },
  { id: "data-sharing", title: "Data sharing" },
  { id: "data-security", title: "Data storage & security" },
  { id: "your-rights", title: "Your rights (GDPR)" },
  { id: "data-retention", title: "Data retention" },
  { id: "third-party", title: "Third-party links" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
]

export function PrivacyPolicyContent() {
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
            {/* Who we are */}
            <section id="who-we-are" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Who we are</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <div className="space-y-1">
                  <p>Saint Yve</p>
                  <p>Dubai Silicon Oasis, UAE</p>
                  <p>
                    Website:{" "}
                    <a href="https://www.designerdrip.store" className="underline hover:text-black transition-colors">
                      https://www.designerdrip.store
                    </a>
                  </p>
                  <p>
                    Contact:{" "}
                    <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                      support@designerdrip.store
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* What data we collect */}
            <section id="what-data" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">What data we collect</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Personal information (name, email address, shipping address, phone number)</li>
                  <li>Order and payment information (processed securely via third-party providers)</li>
                  <li>Account data (login credentials, order history)</li>
                  <li>Communication data (emails, support messages)</li>
                  <li>Technical data (IP address, browser type, device info)</li>
                </ul>
              </div>
            </section>

            {/* How we use your data */}
            <section id="how-we-use" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">How we use your data</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>We use your data for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>To process and fulfill orders</li>
                  <li>To provide customer support</li>
                  <li>To send transactional emails (order confirmations, shipping updates)</li>
                  <li>To improve our website and services</li>
                  <li>To comply with legal obligations</li>
                </ul>
                <p className="font-medium text-black">
                  We do not sell your personal data. We do not collect data unnecessarily.
                </p>
              </div>
            </section>

            {/* Cookies & analytics */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Cookies & analytics</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We use essential cookies for site functionality and analytics tools to understand how our site is used.
                  You can manage cookies through your browser settings.
                </p>
              </div>
            </section>

            {/* Data sharing */}
            <section id="data-sharing" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Data sharing</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We share data only with trusted third parties when necessary to operate our service, including payment
                  providers, shipping partners, and email services.
                </p>
                <p className="font-medium text-black">Your data is never sold to third parties.</p>
              </div>
            </section>

            {/* Data storage & security */}
            <section id="data-security" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Data storage & security</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We implement reasonable technical and organizational measures to protect your data, including secure
                  servers and encrypted connections. While no system is 100% secure, we take protection seriously.
                </p>
              </div>
            </section>

            {/* Your rights (GDPR) */}
            <section id="your-rights" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Your rights (GDPR)</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Under GDPR, you have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Right to access your data</li>
                  <li>Right to correct inaccurate data</li>
                  <li>Right to request deletion</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to data portability</li>
                </ul>
                <p>
                  To exercise your rights, contact us at{" "}
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* Data retention */}
            <section id="data-retention" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Data retention</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We retain your data only as long as necessary for the purposes outlined in this policy, subject to legal
                  and operational requirements. You can request account deletion at any time.
                </p>
              </div>
            </section>

            {/* Third-party links */}
            <section id="third-party" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Third-party links</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Our website may contain links to third-party websites. Saint Yve is not responsible for their privacy
                  practices. We encourage you to review their policies before providing any information.
                </p>
              </div>
            </section>

            {/* Changes to this policy */}
            <section id="changes" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Changes to this policy</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  This Privacy Policy may be updated from time to time. The latest version is always available on this page.
                  We recommend reviewing it periodically.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Contact</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us at{" "}
                  <a href="mailto:support@designerdrip.store" className="underline hover:text-black transition-colors">
                    support@designerdrip.store
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
