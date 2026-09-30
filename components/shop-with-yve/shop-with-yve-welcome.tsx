"use client"

import { ArrowRight } from "lucide-react"
import type { QuickAction } from "./types"

const QUICK_ACTIONS: QuickAction[] = [
  { id: "find-bag", label: "Find a particular bag", draft: "I'm looking for a particular bag." },
  { id: "piece-question", label: "Questions about a piece", draft: "I'd like to know more about a piece." },
  { id: "order-help", label: "Help with an order", draft: "I have a question about an order." },
]

interface ShopWithYveWelcomeProps {
  onSelectQuickAction: (action: QuickAction) => void
}

export function ShopWithYveWelcome({ onSelectQuickAction }: ShopWithYveWelcomeProps) {
  return (
    <div className="flex flex-col px-5 py-6">
      <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-[#6F7075]">Personal Shopping</p>
      <h2 className="mt-3 text-[19px] font-normal leading-[1.25] tracking-[-0.01em] text-[#111111] text-balance">
        How can we help you find your piece?
      </h2>
      <p className="mt-3 text-[13px] font-normal leading-relaxed text-[#6F7075]">
        Questions about a bag, a particular model, or your order? Leave us a message and we&apos;ll take it from
        there.
      </p>

      <div className="mt-7 border-t border-black/10">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelectQuickAction(action)}
            className="group flex w-full items-center justify-between border-b border-black/10 py-4 text-left transition-colors"
          >
            <span className="text-[12px] font-normal uppercase tracking-[0.1em] text-[#111111] group-hover:text-[#6F7075]">
              {action.label}
            </span>
            <ArrowRight
              className="h-3 w-3 shrink-0 -translate-x-0.5 text-[#6F7075] transition-transform duration-200 ease-out group-hover:translate-x-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
