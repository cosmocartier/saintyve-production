"use client"

import type { RefObject } from "react"

interface ShopWithYveBarProps {
  isOpen: boolean
  onOpen: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

/**
 * The discreet, always-present entry point into the Shop With Yve experience.
 * A black architectural service bar fixed to the bottom of the viewport,
 * carrying the Saint Yve personal shopping service through typography alone.
 */
export function ShopWithYveBar({ isOpen, onOpen, triggerRef }: ShopWithYveBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.12] bg-black"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open Shop With Yve personal shopping"
        className="group flex h-[58px] w-full cursor-pointer flex-col items-center justify-center gap-[3px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-inset md:h-[68px] md:gap-1"
      >
        <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/55 transition-colors duration-300 ease-out md:text-[9px] md:tracking-[0.2em]">
          Personal Shopping
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-all duration-300 ease-out group-hover:tracking-[0.26em] group-hover:text-white/90 md:text-[12px] md:tracking-[0.24em]">
          Shop With Yve
        </span>
      </button>
    </div>
  )
}
