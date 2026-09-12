"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccordionItem {
  question: string
  answer: string
}

interface ProductInfoTabsProps {
  description: string | null
}

// ─── Static content ───────────────────────────────────────────────────────────

const PAYMENT_ITEMS: AccordionItem[] = [
  {
    question: "Can I pay in instalments?",
    answer:
      "Yes. We offer instalment payments through Tabby and Postpay. At checkout, select your preferred provider and follow their on-screen steps to split your purchase into easy monthly payments with no hidden fees.",
  },
  {
    question: "Can I combine multiple payment methods?",
    answer:
      "At this time each order can only be paid using a single payment method. If you have a gift card or store credit, this can be applied on top of your chosen payment method during checkout.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. All transactions are processed over TLS-encrypted connections. We never store your full card details — they are handled directly by our PCI-DSS compliant payment processors.",
  },
]

const DELIVERY_ITEMS: AccordionItem[] = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard delivery takes 8–12 working days. Express delivery takes 5–8 working days. Same-day and next-day options may be available for select locations — you'll see all available options at checkout.",
  },
  {
    question: "Is shipping insured?",
    answer:
      "Yes. Every order is fully insured from the moment it leaves our facility until it arrives at your door. In the unlikely event of loss or damage in transit, we will arrange a full replacement or refund.",
  },
  {
    question: "Will I receive tracking?",
    answer:
      "As soon as your order ships you will receive an email with your tracking number and a direct link to follow your parcel in real time. You can also track your order at any time from your account dashboard.",
  },
  {
    question: "Returns & Exchanges",
    answer:
      "We accept returns within 14 days of delivery on items in their original, unworn condition with all tags attached. Please contact our team to initiate a return. Exchanges are subject to availability.",
  },
]

const AUTHENTICITY_ITEMS: AccordionItem[] = [
  {
    question: "Our authentication process",
    answer:
      "Every item passes through a rigorous multi-point inspection carried out by our in-house authentication specialists before it is listed. We cross-reference serial numbers, hardware, stitching, and material composition against the brand's own specifications.",
  },
  {
    question: "Premium materials",
    answer:
      "We source exclusively from authorised channels and trusted luxury resellers. Each piece is assessed for material integrity — from exotic leathers and hardware finishes to dust-bag provenance — ensuring only the highest grade enters our inventory.",
  },
  {
    question: "Quality control",
    answer:
      "Before dispatch, every item undergoes a final quality control check. Condition is graded on our internal scale and clearly stated on the product page so you always know exactly what you are receiving.",
  },
  {
    question: "Packaging & accessories",
    answer:
      "Where available, items are shipped with their original box, dust bag, care booklet, and receipt. Your order is then enclosed in our own signature Saint Yve packaging to ensure it arrives in perfect condition.",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionRow({ question, answer }: AccordionItem) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-[13px] tracking-wide font-normal text-zinc-800 group-hover:text-black transition-colors pr-4">
          {question}
        </span>
        <span className="flex-shrink-0 text-zinc-400 group-hover:text-black transition-colors">
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[13px] leading-relaxed text-zinc-500 pb-5 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DescriptionTab({ description }: { description: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const CLAMP_LINES = 3
  const LINE_HEIGHT = 24 // px — matches leading-relaxed at text-[13px]
  const COLLAPSED_HEIGHT = CLAMP_LINES * LINE_HEIGHT

  if (!description) {
    return (
      <p className="text-[13px] text-zinc-400 leading-relaxed py-2">
        No description available for this product.
      </p>
    )
  }

  return (
    <div>
      <div className="relative">
        <motion.div
          animate={{ height: expanded ? "auto" : COLLAPSED_HEIGHT }}
          transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
          className="overflow-hidden"
        >
          <div ref={contentRef}>
            <div
              className="text-[13px] leading-relaxed text-zinc-700 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-zinc-900 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </motion.div>

        {/* Fade mask when collapsed */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => setExpanded((p) => !p)}
        className="mt-4 group inline-flex items-center gap-1.5"
      >
        <span className="text-[12px] tracking-[0.08em] text-zinc-900 underline underline-offset-[3px] decoration-zinc-300 hover:decoration-zinc-900 transition-all duration-200">
          {expanded ? "View Less" : "View More"}
        </span>
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = ["Description", "Payment Methods", "Delivery & More", "Authenticity"] as const
type Tab = (typeof TABS)[number]

export function ProductInfoTabs({ description }: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Description")
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Keep the animated underline in sync with the active tab
  useEffect(() => {
    const el = tabRefs.current[activeTab]
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [activeTab])

  return (
    <div className="pt-8 border-t border-zinc-100">
      {/* Tab bar */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[tab] = el }}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-shrink-0 pb-3.5 text-[12px] tracking-[0.06em] font-normal whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab ? "text-black" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-100" />
        <motion.div
          className="absolute bottom-0 h-px bg-black"
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
        />
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pt-6"
        >
          {activeTab === "Description" && (
            <DescriptionTab description={description} />
          )}

          {activeTab === "Payment Methods" && (
            <div>
              <p className="text-[13px] leading-relaxed text-zinc-600 mb-6">
                We accept payment via Credit Card (Visa, Mastercard, American Express), PayPal, Bank Transfer, Tabby and Postpay.
              </p>
              <div className="border-t border-zinc-100">
                {PAYMENT_ITEMS.map((item) => (
                  <AccordionRow key={item.question} {...item} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "Delivery & More" && (
            <div className="border-t border-zinc-100">
              {DELIVERY_ITEMS.map((item) => (
                <AccordionRow key={item.question} {...item} />
              ))}
            </div>
          )}

          {activeTab === "Authenticity" && (
            <div className="border-t border-zinc-100">
              {AUTHENTICITY_ITEMS.map((item) => (
                <AccordionRow key={item.question} {...item} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
