"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewRatingProps {
  /** Current rating value, 1-5. */
  rating: number
  /** "display" renders a static, read-only rating. "interactive" renders a clickable selector. */
  mode?: "display" | "interactive"
  size?: "xs" | "sm" | "md" | "lg"
  onChange?: (rating: number) => void
  /** Tone controls the unfilled-star color so the component reads correctly on light and dark backgrounds. */
  tone?: "light" | "dark"
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<ReviewRatingProps["size"]>, string> = {
  xs: "w-2.5 h-2.5",
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
}

const UNFILLED_TONE_CLASSES: Record<NonNullable<ReviewRatingProps["tone"]>, string> = {
  light: "fill-transparent text-zinc-300",
  dark: "fill-transparent text-white/20",
}

/**
 * Renders a 1-5 star rating. Used across the admin form/table and the public review card/summary
 * so the star-rendering logic lives in exactly one place.
 */
export function ReviewRating({
  rating,
  mode = "display",
  size = "sm",
  onChange,
  tone = "light",
  className,
}: ReviewRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const isInteractive = mode === "interactive"
  const previewValue = isInteractive && hoverValue !== null ? hoverValue : rating
  const sizeCls = SIZE_CLASSES[size]

  if (!isInteractive) {
    return (
      <div
        role="img"
        aria-label={`${rating} out of 5 stars`}
        className={cn("flex items-center gap-0.5", className)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(sizeCls, star <= rating ? "fill-yellow-400 text-yellow-400" : UNFILLED_TONE_CLASSES[tone])}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Rating"
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-pressed={star <= rating}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onMouseEnter={() => setHoverValue(star)}
          onClick={() => onChange?.(star)}
          className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Star
            className={cn(sizeCls, star <= previewValue ? "fill-yellow-400 text-yellow-400" : UNFILLED_TONE_CLASSES[tone])}
          />
        </button>
      ))}
    </div>
  )
}
