"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Single source of truth for the authentication certificate image.
// Leave empty to render the editorial placeholder. Once a real certificate
// photograph is available, set this to its URL to render it automatically.
const CERTIFICATE_IMAGE_URL = ""

const processSteps = [
  {
    number: "01",
    title: "Product Selection",
    description:
      "Each piece is considered for inclusion in the SAINT YVE collection, with a focus on CHANEL and HERMÈS handbags.",
  },
  {
    number: "02",
    title: "Authentication Documentation",
    description:
      "Every product is delivered with a third-party authentication certificate. The certificate serves as supporting documentation associated with the purchased item.",
  },
  {
    number: "03",
    title: "Your Purchase, Documented",
    description:
      "Your order is accompanied by its authentication certificate, giving you a tangible record to retain alongside your purchase.",
  },
]

const purchaseRows = [
  {
    label: "The Product",
    description: "Your selected CHANEL or HERMÈS handbag.",
  },
  {
    label: "The Certificate",
    description: "Third-party authentication documentation accompanying the product.",
  },
  {
    label: "Your Records",
    description: "A clear place to retain your order details and accompanying documentation.",
  },
]

const faqItems = [
  {
    question: "Does every SAINT YVE product come with an authentication certificate?",
    answer: "Yes. Every product offered by SAINT YVE is delivered with a third-party authentication certificate.",
  },
  {
    question: "Who authenticates the products?",
    answer:
      "Each product is accompanied by a third-party authentication certificate. For details about the specific authentication provider or the scope of a certificate, please contact our team.",
  },
  {
    question: "What does the authentication certificate mean?",
    answer:
      "The certificate provides third-party authentication documentation associated with the purchased item. The precise scope and details of the assessment depend on the certificate and its issuing provider.",
  },
  {
    question: "Will I receive the certificate with my order?",
    answer: "Yes. The authentication certificate accompanies the product you purchase.",
  },
  {
    question: "Can I ask questions about a specific product before purchasing?",
    answer:
      "Of course. If you would like additional information about a particular item or its accompanying documentation, please contact SAINT YVE before placing your order.",
    hasLink: true,
  },
  {
    question: "How can I learn more about an item's authenticity documentation?",
    answer: "Contact our team with the product details, and we will help clarify the documentation associated with that item.",
  },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500" style={{ letterSpacing: "0.2em" }}>
      {children}
    </p>
  )
}

export function AuthenticityContent() {
  const [openFaq, setOpenFaq] = useState<string | undefined>(undefined)

  return (
    <main>
      {/* SECTION 01 — Editorial Opening */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[11px] font-mono uppercase tracking-[0.25em] text-gray-500 mb-6"
            style={{ letterSpacing: "0.25em" }}
          >
            Saint Yve / Standards
          </p>
          <h1 className="text-[36px] lg:text-[52px] font-light tracking-tight text-black leading-[1.05] mb-8 text-balance">
            Authenticity, considered.
          </h1>
          <p className="text-[15px] lg:text-[16px] font-light text-gray-700 leading-relaxed max-w-2xl">
            Every piece offered by SAINT YVE is selected with authenticity at the center of our process. We work
            with a curated collection of CHANEL and HERMÈS handbags, and every product is delivered with a
            third-party authentication certificate.
          </p>
          <p className="mt-4 text-[13px] font-mono text-gray-500 leading-relaxed">
            Our approach to verification, documentation and trust.
          </p>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 02 — Our Standard */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>01 / Our Standard</SectionLabel>
          <h2 className="mt-5 text-[26px] lg:text-[36px] font-light tracking-tight text-black leading-tight max-w-2xl text-balance">
            Confidence begins with provenance.
          </h2>
          <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-2xl">
            Authenticity is a fundamental consideration in every SAINT YVE offering. Our collection focuses on
            CHANEL and HERMÈS handbags, with authenticity documentation accompanying every product. We believe
            customers should understand not only what they are purchasing, but also the documentation provided
            with their order.
          </p>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10 lg:gap-16">
            <div>
              <p className="text-[24px] lg:text-[30px] font-light text-black leading-[1.2] text-balance">
                Luxury deserves more than an assumption.
              </p>
            </div>
            <div className="hidden lg:block bg-gray-200" />
            <div className="border-t border-gray-200 pt-6 lg:border-t-0 lg:pt-0">
              <p className="text-[14px] font-light text-gray-700 leading-relaxed">
                We believe transparency is inseparable from luxury. That means being clear about what a piece is,
                where it comes from, and what documentation accompanies it — so a purchase is never left to
                assumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 03 — The Authentication Process */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>02 / The Process</SectionLabel>
          <h2 className="mt-5 text-[26px] lg:text-[36px] font-light tracking-tight text-black leading-tight max-w-2xl text-balance">
            From selection to documentation.
          </h2>
          <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-2xl">
            Authenticity is supported by a clear documentation process. Each product is delivered with a
            third-party authentication certificate, providing an additional reference for the item purchased.
          </p>

          <div className="mt-16 border-t border-gray-200">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="grid grid-cols-[auto_1fr] lg:grid-cols-[80px_260px_1fr] gap-x-6 gap-y-3 py-8 lg:py-10 border-b border-gray-200"
              >
                <span className="text-[13px] font-mono text-gray-400 tracking-wider">{step.number}</span>
                <h3 className="text-[17px] lg:text-[19px] font-light text-black leading-snug lg:col-start-2">
                  {step.title}
                </h3>
                <p className="col-span-2 lg:col-span-1 lg:col-start-3 mt-2 lg:mt-0 text-[14px] font-light text-gray-700 leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 04 — Third-Party Authentication Certificate */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>03 / Documentation</SectionLabel>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-[26px] lg:text-[34px] font-light tracking-tight text-black leading-tight text-balance">
                A certificate with every piece.
              </h2>
              <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-md">
                Every SAINT YVE product is delivered with a third-party authentication certificate. We consider
                this documentation an important part of the purchasing experience, giving customers an additional
                point of reference for their item.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              {CERTIFICATE_IMAGE_URL ? (
                <div className="relative w-full aspect-[4/3] overflow-hidden border border-gray-200">
                  <Image
                    src={CERTIFICATE_IMAGE_URL}
                    alt="SAINT YVE third-party authentication certificate"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[4/3] border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 px-6">
                  <div className="w-10 h-px bg-gray-300" />
                  <p
                    className="text-[12px] font-mono uppercase tracking-[0.2em] text-gray-500 text-center"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    Authentication Certificate
                  </p>
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400 text-center"
                    style={{ letterSpacing: "0.15em" }}
                  >
                    Image to be integrated
                  </p>
                  <div className="w-10 h-px bg-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 05 — What Customers Receive */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>04 / Your Purchase</SectionLabel>
          <h2 className="mt-5 text-[26px] lg:text-[36px] font-light tracking-tight text-black leading-tight max-w-2xl text-balance">
            Documentation that stays with you.
          </h2>
          <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-2xl">
            Your purchase includes its third-party authentication certificate. We encourage customers to retain the
            documentation alongside their item and order records.
          </p>

          <div className="mt-16 border-t border-gray-200">
            {purchaseRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-2 lg:gap-10 py-7 border-b border-gray-200"
              >
                <h3 className="text-[15px] font-light text-black">{row.label}</h3>
                <p className="text-[14px] font-light text-gray-700 leading-relaxed">{row.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 06 — Transparency and Trust */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>05 / Transparency</SectionLabel>
          <h2 className="mt-5 text-[26px] lg:text-[36px] font-light tracking-tight text-black leading-tight text-balance">
            Clear information. Considered decisions.
          </h2>
          <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-2xl">
            We believe purchasing pre-owned luxury should come with clear information about the product and its
            accompanying documentation. Our approach is built around authenticity, transparency, and a considered
            customer experience.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 border-t border-gray-200 pt-10">
            <div>
              <h3 className="text-[16px] font-light text-black mb-3">Authenticity matters.</h3>
              <p className="text-[14px] font-light text-gray-700 leading-relaxed">
                Every product offered by SAINT YVE is accompanied by a third-party authentication certificate.
              </p>
            </div>
            <div className="lg:border-l lg:border-gray-200 lg:pl-16">
              <h3 className="text-[16px] font-light text-black mb-3">Questions are welcome.</h3>
              <p className="text-[14px] font-light text-gray-700 leading-relaxed">
                If you would like further information about a particular item or its accompanying documentation,
                our team is available to assist.
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.15em] text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
                style={{ letterSpacing: "0.15em" }}
              >
                Contact Saint Yve
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 07 — FAQ */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>06 / Frequently Asked Questions</SectionLabel>
          <h2 className="mt-5 text-[26px] lg:text-[36px] font-light tracking-tight text-black leading-tight text-balance">
            A few things worth knowing.
          </h2>

          <Accordion
            type="single"
            collapsible
            value={openFaq}
            onValueChange={setOpenFaq}
            className="mt-12 border-t border-gray-200"
          >
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="py-6 text-[15px] font-light text-black hover:no-underline [&>svg]:text-gray-400 [&>svg]:size-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-[14px] font-light text-gray-700 leading-relaxed max-w-xl">
                    {item.answer}
                    {item.hasLink && (
                      <>
                        {" "}
                        <Link href="/contact-us" className="underline text-black hover:text-gray-600 transition-colors">
                          Contact us here
                        </Link>
                        .
                      </>
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <div className="h-px w-full bg-gray-200" />

      {/* SECTION 08 — Closing Statement */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[28px] lg:text-[40px] font-light tracking-tight text-black leading-tight text-balance">
            Considered with care.
          </h2>
          <p className="mt-6 text-[14px] lg:text-[15px] font-light text-gray-700 leading-relaxed max-w-xl mx-auto">
            Explore the SAINT YVE collection of CHANEL and HERMÈS handbags, with authenticity documentation
            accompanying every purchase.
          </p>
          <Link
            href="/collections"
            className="mt-8 inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.15em] text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
            style={{ letterSpacing: "0.15em" }}
          >
            Explore the Collection
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
