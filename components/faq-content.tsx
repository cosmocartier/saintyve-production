"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ data structure
const faqData = {
  orders: {
    label: "Orders",
    questions: [
      {
        question: "I didn't receive an order confirmation.",
        answer:
          "Order confirmations are sent immediately after checkout. Please check spam or promotions. If you still can't find it, contact support.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer:
          "Once processing has started, changes or cancellations may not be possible. Contact us as soon as possible and we'll do our best to assist.",
      },
      {
        question: 'What does "processing" mean?',
        answer: "Processing means your order is being prepared, quality-checked, and scheduled for shipment.",
      },
      {
        question: "Will my order ship in one package?",
        answer: "Some orders may ship in separate packages to ensure faster delivery.",
      },
    ],
  },
  shipping: {
    label: "Shipping",
    questions: [
      {
        question: "When will I receive tracking information?",
        answer: "Tracking details are emailed automatically once your order has been shipped.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times vary by destination, but most orders arrive within the estimated timeframe shown at checkout.",
      },
      {
        question: "My tracking hasn't updated yet. Is this normal?",
        answer: "Yes. Tracking updates may pause temporarily, especially during transit between facilities.",
      },
      {
        question: "Do I need to pay customs or duties?",
        answer: "Customs policies vary by country. Any applicable duties are determined by local authorities.",
      },
    ],
  },
  returns: {
    label: "Returns & Refunds",
    questions: [
      {
        question: "Can I return an item?",
        answer:
          "Return eligibility depends on the item and condition. Please contact support before sending anything back.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Once approved, refunds are usually processed within a few business days, depending on your payment provider.",
      },
      {
        question: "I received a wrong or damaged item. What should I do?",
        answer: "Contact us with your order number and clear photos of the issue so we can resolve it quickly.",
      },
      {
        question: "An item is missing from my order.",
        answer: "If something is missing, contact us immediately and we'll investigate.",
      },
    ],
  },
  payments: {
    label: "Payments",
    questions: [
      {
        question: "Which payment methods do you accept?",
        answer: "We accept major payment methods, including cards and supported digital wallets shown at checkout.",
      },
      {
        question: "My payment failed or is pending.",
        answer:
          "This usually relates to bank or security checks. Trying again or using a different method often resolves it.",
      },
      {
        question: "Why was my payment declined?",
        answer: "Declines are typically issued by your bank or payment provider, not by us.",
      },
    ],
  },
  product: {
    label: "Product & Sizing",
    questions: [
      {
        question: "How do I choose the right size?",
        answer: "Each product includes a Size & Fit section with detailed guidance. When in doubt, contact us.",
      },
      {
        question: "Do product photos match the actual item?",
        answer:
          "Yes. All photos are professionally shot. Minor color variations may occur due to lighting or screen settings.",
      },
      {
        question: "How should I care for my item?",
        answer: "Care instructions are listed in the product details. Following them ensures longevity.",
      },
    ],
  },
  membership: {
    label: "Platinum Membership",
    questions: [
      {
        question: "What is Platinum Membership?",
        answer: "Platinum offers priority handling, exclusive rewards, and monthly drops for members.",
      },
      {
        question: "When do monthly rewards drop?",
        answer: "New rewards are released on the 1st of each month.",
      },
      {
        question: "How do credits work?",
        answer: "Credits are added to your account and can be used during checkout.",
      },
      {
        question: "Where can I see my credits?",
        answer: "Your available credits are visible in your account dashboard.",
      },
    ],
  },
  account: {
    label: "Account & Privacy",
    questions: [
      {
        question: "How can I delete my account?",
        answer: "Contact support and we'll securely remove your account and associated data.",
      },
      {
        question: "Can I change my email address?",
        answer: "Yes. Contact support and we'll assist you.",
      },
      {
        question: "How do I unsubscribe from emails?",
        answer: "You can unsubscribe anytime via the link in our emails.",
      },
    ],
  },
}

type CategoryKey = keyof typeof faqData

export function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all")

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return Object.entries(faqData).reduce(
      (acc, [key, category]) => {
        // Skip if category filter is active and doesn't match
        if (selectedCategory !== "all" && key !== selectedCategory) {
          return acc
        }

        const filteredQuestions = category.questions.filter(
          (faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
        )

        if (filteredQuestions.length > 0) {
          acc[key as CategoryKey] = {
            label: category.label,
            questions: filteredQuestions,
          }
        }

        return acc
      },
      {} as typeof faqData,
    )
  }, [searchQuery, selectedCategory])

  const categoryKeys = Object.keys(faqData) as CategoryKey[]

  return (
    <section className="pb-20 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search a question…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 text-[13px] font-mono border border-gray-200 focus:border-black focus:ring-0 transition-colors"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-12 overflow-x-auto hide-scrollbar pb-2">
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.1em] whitespace-nowrap transition-colors border ${
                selectedCategory === "all"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {categoryKeys.map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.1em] whitespace-nowrap transition-colors border ${
                  selectedCategory === key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {faqData[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion by Category */}
        {Object.keys(filteredFAQs).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(filteredFAQs).map(([key, category]) => (
              <div key={key}>
                <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-black mb-6">{category.label}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={`${key}-${index}`}
                      value={`${key}-${index}`}
                      className="border border-gray-200 bg-white"
                    >
                      <AccordionTrigger className="px-6 py-4 text-left text-[13px] font-mono text-black hover:no-underline hover:bg-gray-50 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-2 text-[13px] font-mono text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[13px] font-mono text-gray-500">
              No questions found matching "{searchQuery}". Try different keywords or{" "}
              <a href="/contact-us" className="text-black underline hover:text-gray-600">
                contact support
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
