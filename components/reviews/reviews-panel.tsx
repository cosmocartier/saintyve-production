"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, Star } from "lucide-react"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewSkeleton } from "@/components/reviews/review-skeleton"
import { ReviewSort } from "@/components/reviews/review-sort"
import type { Review, ReviewSortOrder, ReviewsResponse } from "@/lib/types/review"

interface ReviewsPanelProps {
  open: boolean
  onClose: () => void
}

const PAGE_SIZE = 12

export function ReviewsPanel({ open, onClose }: ReviewsPanelProps) {
  const [sort, setSort] = useState<ReviewSortOrder>("recent")
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const loadReviews = useCallback(async (sortOrder: ReviewSortOrder, offset: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    setError(false)

    try {
      const res = await fetch(`/api/reviews?sort=${sortOrder}&offset=${offset}&limit=${PAGE_SIZE}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to load reviews")
      const data: ReviewsResponse = await res.json()

      setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews))
      setTotal(data.total)
      setHasMore(data.hasMore)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Fetch reviews only when the panel is opened (or the sort changes while open)
  useEffect(() => {
    if (open) {
      loadReviews(sort, 0, false)
    }
  }, [open, sort, loadReviews])

  // Body scroll lock + ESC to close
  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)

    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  const handleOverlayClick = () => onClose()

  const handleRetry = () => loadReviews(sort, 0, false)

  const handleLoadMore = () => loadReviews(sort, reviews.length, true)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="our-reviews-heading"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative bg-white w-full h-[92vh] lg:h-[88vh] lg:w-[93vw] lg:max-w-[1450px] rounded-t-sm lg:rounded-sm border border-[#f0f0f0] shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom lg:fade-in lg:slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 lg:px-12 py-7 lg:py-8 border-b border-[#f0f0f0] flex-shrink-0">
          <div>
            <h2 id="our-reviews-heading" className="text-[15px] lg:text-[18px] font-mono uppercase tracking-[0.14em] text-black">
              Our Reviews
            </h2>
            {total > 0 && (
              <p className="text-[11px] font-mono text-zinc-400 mt-2 tracking-[0.08em]">
                {total} verified review{total === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close reviews"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black transition-colors duration-300 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Controls */}
        {!error && reviews.length > 0 && (
          <div className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-[#f0f0f0] flex-shrink-0">
            <span className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-[0.12em]">
              <Star className="w-2.5 h-2.5 fill-black text-black" strokeWidth={1} />
              Verified customer reviews
            </span>
            <ReviewSort value={sort} onChange={setSort} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 pb-20 lg:pb-16">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-[13px] font-mono text-zinc-500">Reviews are temporarily unavailable.</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-[11px] font-mono uppercase tracking-[0.15em] text-white bg-black px-5 py-2.5 rounded-sm hover:opacity-85 transition-opacity duration-300 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ReviewSkeleton key={i} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] font-mono text-zinc-400 uppercase tracking-[0.1em]">No reviews yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="text-[11px] font-mono uppercase tracking-[0.15em] text-black border border-black px-6 py-3 rounded-sm hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Trustpilot attribution badge */}
        <div className="absolute bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-full pl-3 pr-3.5 py-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
            <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-zinc-400">Powered by</span>
            <Image
              src="/images/trustpilot-logo.png"
              alt="Trustpilot"
              width={90}
              height={22}
              className="h-4 w-auto object-contain"
            /> 
          </div>
        </div>
      </div>
    </div>
  )
}
