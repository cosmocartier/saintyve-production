"use client"

import { useState } from "react"
import { RequestMediaLink } from "@/components/product-page/request-media-link"
import { FactoryMediaViewer } from "@/components/product-page/factory-media-viewer"
import type { FactoryMediaItem } from "@/lib/types/product"

interface FactoryMediaCTAProps {
  productTitle: string
  factoryMedia: FactoryMediaItem[]
}

export function FactoryMediaCTA({ productTitle, factoryMedia }: FactoryMediaCTAProps) {
  const [isOpen, setIsOpen] = useState(false)

  // No factory media for this product: fall back to the original WhatsApp CTA, unchanged.
  if (factoryMedia.length === 0) {
    return <RequestMediaLink productTitle={productTitle} />
  }

  const mediaCount = factoryMedia.length

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`View ${mediaCount} factory photos and videos for ${productTitle}`}
        className="w-full h-[52px] flex items-center justify-center px-6 rounded-none bg-zinc-100 text-[#111111] cursor-pointer hover:bg-zinc-200 active:bg-zinc-300 transition-colors active:scale-[0.99]"
      >
        <span className="text-[11px] font-medium tracking-[0.18em] uppercase">
          View {mediaCount} factory photos &amp; videos
        </span>
      </button>
      <FactoryMediaViewer
        media={factoryMedia}
        productTitle={productTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
