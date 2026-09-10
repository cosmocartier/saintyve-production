"use client"

import { useRef, useState } from "react"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { ReviewMediaLightbox } from "@/components/reviews/review-media-lightbox"
import type { ReviewMediaItem } from "@/lib/types/review"

interface ReviewMediaGalleryProps {
  /** Already filtered to exclude any items that previously failed to load. */
  media: ReviewMediaItem[]
  onImageError: (id: string) => void
}

function GalleryImage({
  item,
  className,
  onLoad,
  onError,
  onClick,
}: {
  item: ReviewMediaItem
  className: string
  onLoad: () => void
  onError: () => void
  onClick: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="View customer photo"
      className={`relative overflow-hidden bg-zinc-100 rounded-[3px] cursor-pointer ${className}`}
    >
      {!loaded && <div className="absolute inset-0 bg-zinc-100 animate-pulse" />}
      <img
        src={buildCfUrl(item.cf_image_id, "watermark") || "/placeholder.svg"}
        alt={item.alt_text || "Customer photo"}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          setLoaded(true)
          onLoad()
        }}
        onError={onError}
      />
    </button>
  )
}

export function ReviewMediaGallery({ media, onImageError }: ReviewMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || el.children.length === 0) return
    const itemWidth = (el.children[0] as HTMLElement).offsetWidth
    const gap = 8
    const index = Math.round(el.scrollLeft / (itemWidth + gap))
    setActiveIndex(Math.min(Math.max(index, 0), media.length - 1))
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (media.length === 0) return null

  if (media.length === 1) {
    return (
      <>
        <GalleryImage
          item={media[0]}
          className="w-full aspect-[4/3] max-h-[220px]"
          onLoad={() => {}}
          onError={() => onImageError(media[0].id)}
          onClick={() => openLightbox(0)}
        />
        <ReviewMediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((item, index) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <GalleryImage
                item={item}
                className="w-[128px] h-[128px]"
                onLoad={() => {}}
                onError={() => onImageError(item.id)}
                onClick={() => openLightbox(index)}
              />
            </div>
          ))}
        </div>
        <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono text-white bg-black/55 px-1.5 py-0.5 rounded-[2px] pointer-events-none">
          {activeIndex + 1} / {media.length}
        </span>
      </div>
      <ReviewMediaLightbox
        media={media}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
