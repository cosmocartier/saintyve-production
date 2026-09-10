"use client"

import { useState } from "react"
import { ReviewsBadge } from "@/components/reviews/reviews-badge"
import { ReviewsPanel } from "@/components/reviews/reviews-panel"

// Renders only where explicitly mounted (currently the landing page).
// Keep this modular so other pages can opt in later without global side effects.
export function OurReviews() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ReviewsBadge onClick={() => setIsOpen(true)} />
      <ReviewsPanel open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
