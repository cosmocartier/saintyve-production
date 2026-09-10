"use client"

import { Search } from "lucide-react"

export type PublishedFilter = "all" | "published" | "unpublished"

interface ReviewsFiltersProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  publishedFilter: PublishedFilter
  onPublishedFilterChange: (value: PublishedFilter) => void
  resultCount: number
}

const FILTERS: { value: PublishedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
]

export function ReviewsFilters({
  searchTerm,
  onSearchTermChange,
  publishedFilter,
  onPublishedFilterChange,
  resultCount,
}: ReviewsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
        <input
          type="text"
          placeholder="Search by customer name or review text..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/15 transition-colors"
        />
      </div>
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onPublishedFilterChange(f.value)}
            className={`px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
              publishedFilter === f.value
                ? "bg-white/5 text-white/90 border border-white/10"
                : "text-white/35 border border-transparent hover:bg-white/[0.03] hover:text-white/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-white/25 flex-shrink-0">
        {resultCount} review{resultCount !== 1 ? "s" : ""}
      </span>
    </div>
  )
}
