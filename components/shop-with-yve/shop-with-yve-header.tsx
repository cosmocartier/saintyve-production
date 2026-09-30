"use client"

import type { RefObject } from "react"
import { X } from "lucide-react"

interface ShopWithYveHeaderProps {
  onClose: () => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
}

export function ShopWithYveHeader({ onClose, closeButtonRef }: ShopWithYveHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-4">
      <div>
        <p className="text-[12px] font-normal uppercase tracking-[0.2em] text-[#111111]">Saint Yve</p>
        <p className="mt-1 text-[10px] font-normal uppercase tracking-[0.18em] text-[#6F7075]">Personal Shopping</p>
      </div>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close Shop With Yve"
        className="flex h-9 w-9 items-center justify-center text-[#111111] transition-colors hover:text-[#6F7075]"
      >
        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  )
}
