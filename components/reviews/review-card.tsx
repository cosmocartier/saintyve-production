"use client"

import { useState } from "react"
import Image from "next/image"
import { getCountryFlag, getCountryFlagImage } from "@/lib/reviews/country-flag"
import { ReviewProduct } from "@/components/reviews/review-product"
import { ReviewMedia } from "@/components/reviews/review-media"
import { ReviewRating } from "@/components/reviews/review-rating"
import type { Review } from "@/lib/types/review"

interface ReviewCardProps {
  review: Review
}

function formatReviewDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.review.length > 220
  const flagImage = getCountryFlagImage(review.country)

  return (
    <article className="flex flex-col bg-white border border-[#f0f0f0] rounded-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {flagImage ? (
            <Image
              src={flagImage}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 rounded-[3px] object-cover shrink-0"
              aria-hidden="true"
            />
          ) : (
            <span aria-hidden="true" className="text-base leading-none">
              {getCountryFlag(review.country)}
            </span>
          )}
          <span className="text-[13px] font-mono text-black truncate">{review.customer_name}</span>
        </div>
        <time dateTime={review.review_date} className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
          {formatReviewDate(review.review_date)}
        </time>
      </div>

      {review.rating >= 4 ? (
        <Image
          src={review.rating === 5 ? "/images/trustpilot-5-star.png" : "/images/trustpilot-4-star.png"}
          alt={`${review.rating} out of 5 stars`}
          width={11}
          height={22}
          className="h-[20px] w-auto object-contain object-left self-start mb-2"
        />
      ) : (
        <ReviewRating rating={review.rating} size="xs" className="mb-2" />
      )}

      {review.title && (
        <h3 className="text-[13px] font-mono font-semibold text-black mb-1 text-pretty">{review.title}</h3>
      )}

      <p className={`text-[13px] font-mono leading-relaxed text-zinc-700 ${expanded ? "" : "line-clamp-5"}`}>
        {review.review}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-mono uppercase tracking-[0.1em] text-black underline underline-offset-4 mt-2 self-start cursor-pointer hover:opacity-60 transition-opacity"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {review.media && review.media.length > 0 && <ReviewMedia media={review.media} />}

      {review.product && (
        <div className="mt-auto">
          <ReviewProduct product={review.product} />
        </div>
      )}
    </article>
  )
}
