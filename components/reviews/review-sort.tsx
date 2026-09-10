"use client"

import type { ReviewSortOrder } from "@/lib/types/review"

interface ReviewSortProps {
  value: ReviewSortOrder
  onChange: (value: ReviewSortOrder) => void
}

export function ReviewSort({ value, onChange }: ReviewSortProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Sort reviews</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ReviewSortOrder)}
        className="appearance-none bg-transparent border border-[#e5e5e5] rounded-sm text-[11px] font-mono uppercase tracking-[0.1em] text-black px-3 py-2 cursor-pointer focus:outline-none focus:border-black transition-colors"
      >
        <option value="recent">Recent</option>
        <option value="oldest">Oldest</option>
      </select>
    </label>
  )
}
