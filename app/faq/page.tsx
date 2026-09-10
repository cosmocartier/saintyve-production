import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FAQContent } from "@/components/faq-content"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "FAQ | Designerdrip",
  description:
    "Answers to the most common questions about orders, shipping, returns, payments, sizing, and membership at Designerdrip.",
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[32px] lg:text-[40px] font-light tracking-tight text-black mb-6 leading-tight">FAQ</h1>
          <p className="text-[14px] lg:text-[15px] font-mono text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Answers to the most common questions. If you need personal assistance, our support team is here to help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact-us">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                Contact Support
              </Button>
            </Link>
            <p className="text-[12px] font-mono text-gray-500">
              Order tracking is sent automatically by email once shipped.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content - Client Component with search and filtering */}
      <FAQContent />

      {/* Still Need Help Section */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 p-8 lg:p-12 text-center">
            <p className="text-[15px] font-mono text-gray-700 mb-6">
              Still have questions? Our support team is here to help.
            </p>
            <Link href="/contact-us">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-[12px] font-mono uppercase tracking-[0.1em]">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
