"use client"

import type { RefObject } from "react"
import { ArrowRight } from "lucide-react"

interface ShopWithYveBarProps {
  isOpen: boolean
  onOpen: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

/**
 * The discreet, always-present entry point into the Shop With Yve experience.
 * A single, confident typographic line fixed to the bottom of the viewport.
 */
export function ShopWithYveBar({ isOpen, onOpen, triggerRef }: ShopWithYveBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open Shop With Yve personal shopping"
        className="group flex h-[42px] w-full items-center justify-center gap-2 text-[#111111] transition-colors md:h-[46px]"
      >
        <span className="text-[11px] font-normal uppercase tracking-[0.24em]">Shop With Yve</span>
        <ArrowRight
          className="h-3 w-3 -translate-x-0.5 text-[#111111] transition-transform duration-200 ease-out group-hover:translate-x-0"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
