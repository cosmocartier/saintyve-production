"use client"

import { Plus } from "lucide-react"

interface ReviewsHeaderProps {
  onAddReview: () => void
}

export function ReviewsHeader({ onAddReview }: ReviewsHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management</p>
        <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">Reviews</h1>
        <p className="font-sans text-[10px] tracking-wide text-white/30">
          Manage customer reviews shown on the storefront
        </p>
      </div>
      <button
        onClick={onAddReview}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all"
      >
        <Plus size={13} />
        Add Review
      </button>
    </div>
  )
}
