"use client"

import { useMemo, useState } from "react"
import { ReviewMediaGallery } from "@/components/reviews/review-media-gallery"
import type { ReviewMediaItem } from "@/lib/types/review"

interface ReviewMediaProps {
  media: ReviewMediaItem[]
}

export function ReviewMedia({ media }: ReviewMediaProps) {
  const [erroredIds, setErroredIds] = useState<Set<string>>(new Set())

  const visibleMedia = useMemo(() => media.filter((m) => !erroredIds.has(m.id)), [media, erroredIds])

  const handleImageError = (id: string) => {
    setErroredIds((prev) => new Set(prev).add(id))
  }

  if (!media || media.length === 0 || visibleMedia.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-2">Customer photos</p>
      <ReviewMediaGallery media={visibleMedia} onImageError={handleImageError} />
    </div>
  )
}
