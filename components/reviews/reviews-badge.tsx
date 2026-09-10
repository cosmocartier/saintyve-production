"use client"

import Image from "next/image"

interface ReviewsBadgeProps {
  onClick: () => void
}

// Shared, deliberately slow easing — the interaction should be felt, not noticed.
const EASE = "cubic-bezier(0.19,1,0.22,1)"

export function ReviewsBadge({ onClick }: ReviewsBadgeProps) {
  return (
    <>
      {/* Desktop / tablet — quiet edge control, left margin of the viewport */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open our reviews"
        className="group hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center bg-black text-white w-9 py-7 pr-0 border border-white/[0.08] border-l-0 rounded-r-sm cursor-pointer hover:bg-zinc-900 hover:pr-1"
        style={{ transition: `background-color 700ms ${EASE}, padding-right 700ms ${EASE}` }}
      >
        <span className="flex flex-col items-center gap-4 transition-colors duration-700" style={{ transitionTimingFunction: EASE }}>
          <span
            className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/80 group-hover:text-white whitespace-nowrap transition-colors duration-700"
            style={{ writingMode: "vertical-rl", transitionTimingFunction: EASE }}
          >
            Our Reviews
          </span>
          <Image
            src="/images/reviews-star-badge.png"
            alt=""
            width={14}
            height={14}
            className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:-translate-y-0.5"
            style={{ transitionTimingFunction: EASE }}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Mobile — edge-mounted tab, not a floating pill. Sits mid-viewport on the right edge, clear of the top nav and any bottom bars. */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open our reviews"
        className="md:hidden fixed right-0 top-[58%] -translate-y-1/2 z-40 flex flex-col items-center bg-black text-white w-8 py-5 border border-white/[0.08] border-r-0 rounded-l-sm cursor-pointer active:bg-zinc-900 transition-colors duration-300"
      >
        <span className="flex flex-col items-center gap-3">
          <span
            className="text-[9px] font-mono uppercase tracking-[0.24em] text-white/80 whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            Reviews
          </span>
          <Image
            src="/images/reviews-star-badge.png"
            alt=""
            width={14}
            height={14}
            className="w-3 h-3 opacity-70 rotate-[18deg]"
            aria-hidden="true"
          />
        </span>
      </button>
    </>
  )
}
