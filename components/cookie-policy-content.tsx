"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

const sections = [
  { id: "what-are-cookies", title: "What Are Cookies" },
  { id: "how-we-use", title: "How We Use Cookies" },
  { id: "types", title: "Types of Cookies We Use" },
  { id: "third-party", title: "Third-Party Cookies" },
  { id: "managing", title: "Managing Cookies" },
  { id: "consent", title: "Consent" },
  { id: "updates", title: "Updates to This Policy" },
  { id: "contact", title: "Contact" },
]

const cookieTypes = [
  {
    type: "Essential",
    purpose: "Core site functionality, authentication, shopping cart",
    example: "Session cookies, security tokens",
  },
  {
    type: "Analytics",
    purpose: "Understand site usage, traffic patterns, performance metrics",
    example: "Page views, navigation paths",
  },
  {
    type: "Functional",
    purpose: "Remember preferences, language, region, display settings",
    example: "Language selection, theme preference",
  },
  {
    type: "Marketing",
    purpose: "Deliver relevant advertising, measure ad performance",
    example: "Ad impressions, conversion tracking",
  },
]

export function CookiePolicyContent() {
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
            {/* What Are Cookies */}
            <section id="what-are-cookies" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">What Are Cookies</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Cookies are small text files stored on your device when you visit a website. They help the site
                  remember information about your visit, such as your preferences, login status, and browsing behavior.
                </p>
                <p>
                  Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (stored
                  on your device until they expire or are manually deleted).
                </p>
                <p>
                  Similar technologies include web beacons, pixels, and local storage, which serve comparable functions
                  for tracking and improving your experience.
                </p>
              </div>
            </section>

            {/* How We Use Cookies */}
            <section id="how-we-use" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">How We Use Cookies</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>Designerdrip uses cookies to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Enable core website functionality, such as login, checkout, and account management</li>
                  <li>Maintain security and prevent fraud or unauthorized access</li>
                  <li>Analyze site usage, traffic patterns, and user behavior to improve performance</li>
                  <li>Remember your preferences, such as language, currency, and display settings</li>
                  <li>Deliver relevant content and advertising based on your interests</li>
                </ul>
                <p>
                  Without certain cookies, features like shopping carts, account access, and saved preferences may not
                  function properly.
                </p>
              </div>
            </section>

            {/* Types of Cookies We Use */}
            <section id="types" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">
                Types of Cookies We Use
              </h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Designerdrip uses different types of cookies, each serving a specific purpose. The table below
                  provides an overview:
                </p>
                <Card className="overflow-hidden border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-mono text-[12px] text-black">Type</TableHead>
                        <TableHead className="font-mono text-[12px] text-black">Purpose</TableHead>
                        <TableHead className="font-mono text-[12px] text-black">Example</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cookieTypes.map((cookie, index) => (
                        <TableRow key={index} className="border-gray-100">
                          <TableCell className="font-mono text-[13px] font-medium text-black">{cookie.type}</TableCell>
                          <TableCell className="font-mono text-[13px] text-gray-700">{cookie.purpose}</TableCell>
                          <TableCell className="font-mono text-[13px] text-gray-600">{cookie.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                <p className="text-[13px] text-gray-600 italic">
                  Note: Examples are generic placeholders. Specific cookies used may vary.
                </p>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section id="third-party" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Third-Party Cookies</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  Some cookies on Designerdrip are set by third-party services that we use to enhance your experience.
                  These may include:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <span className="font-medium">Analytics providers</span> — to measure traffic, user behavior, and
                    site performance
                  </li>
                  <li>
                    <span className="font-medium">Payment processors</span> — to securely handle transactions and
                    checkout
                  </li>
                  <li>
                    <span className="font-medium">Advertising partners</span> — to deliver relevant ads and measure
                    campaign effectiveness
                  </li>
                  <li>
                    <span className="font-medium">Media providers</span> — to embed videos or content from external
                    platforms
                  </li>
                </ul>
                <p>
                  These third-party providers have their own privacy policies and cookie practices. We recommend
                  reviewing their policies to understand how they collect and use your data.
                </p>
                <p>Designerdrip does not control third-party cookies and is not responsible for their usage.</p>
              </div>
            </section>

            {/* Managing Cookies */}
            <section id="managing" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Managing Cookies</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>You have control over how cookies are used on your device. Options include:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <span className="font-medium">Browser settings</span> — Most browsers allow you to block or delete
                    cookies through their settings menu. Consult your browser's help documentation for instructions.
                  </li>
                  <li>
                    <span className="font-medium">Clear cookies</span> — You can manually clear cookies from your device
                    at any time through your browser.
                  </li>
                  <li>
                    <span className="font-medium">Opt-out tools</span> — Some advertising networks provide opt-out
                    mechanisms for targeted ads (e.g.,{" "}
                    <a
                      href="https://optout.aboutads.info/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black transition-colors"
                    >
                      aboutads.info
                    </a>
                    ).
                  </li>
                </ul>
                <Card className="bg-gray-50 border-gray-200 p-4 mt-6">
                  <p className="text-[13px] font-mono text-gray-700 leading-relaxed">
                    <span className="font-medium text-black">Important:</span> Disabling certain cookies may impact site
                    functionality, such as checkout, account access, and saved preferences. Essential cookies are
                    required for the site to operate properly.
                  </p>
                </Card>
              </div>
            </section>

            {/* Consent */}
            <section id="consent" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Consent</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  When you first visit Designerdrip, you may see a consent banner informing you about our use of
                  cookies. By clicking "Accept" or continuing to use our site, you consent to our use of cookies as
                  described in this policy.
                </p>
                <p>
                  Essential cookies (required for core functionality) may be set without explicit consent, as they are
                  necessary for the website to operate.
                </p>
                <p>
                  You can withdraw or update your consent at any time by adjusting your cookie preferences through your
                  browser settings or our cookie management tool (if available).
                </p>
              </div>
            </section>

            {/* Updates to This Policy */}
            <section id="updates" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">
                Updates to This Policy
              </h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or
                  legal requirements. The latest version will always be available on this page, and the "Last updated"
                  date will be revised accordingly.
                </p>
                <p>
                  We encourage you to review this policy periodically to stay informed about how we use cookies and
                  similar technologies.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-[18px] font-mono font-medium text-black mb-4 tracking-tight">Contact</h2>
              <div className="space-y-4 text-[14px] font-mono text-gray-700 leading-relaxed">
                <p>If you have questions about this Cookie Policy or how we use cookies, please contact us at:</p>
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
                  <p>
                    Website:{" "}
                    <a href="/contact-us" className="underline hover:text-black transition-colors">
                      Contact Us
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
