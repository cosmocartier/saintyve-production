"use client"

import { useEffect, useRef } from "react"
import { ReviewRow } from "@/components/admin/reviews/review-row"
import type { AdminReview } from "@/lib/types/review"

interface ReviewsTableProps {
  reviews: AdminReview[]
  loading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onEdit: (review: AdminReview) => void
  onTogglePublished: (review: AdminReview) => void
  onDelete: (review: AdminReview) => void
}

const COLUMNS = ["Customer", "Review", "Rating", "Product", "Date", "Media", "Status", "Actions"]

export function ReviewsTable({
  reviews,
  loading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onEdit,
  onTogglePublished,
  onDelete,
}: ReviewsTableProps) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {COLUMNS.map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 ${
                      h === "Actions" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onEdit={onEdit}
                    onTogglePublished={onTogglePublished}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-white/25">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white/10 border-t-white/40" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {!loading && !hasMore && reviews.length > 0 && (
        <div className="text-center py-4">
          <p className="font-sans text-[10px] uppercase tracking-widest text-white/15">All reviews loaded</p>
        </div>
      )}
    </div>
  )
}
