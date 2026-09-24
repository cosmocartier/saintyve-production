"use client"

import type { Product } from "@/lib/types/product"
import { ProductImageZoom } from "@/components/product-image-zoom"
import { generateAltText } from "@/lib/generate-alt-text"

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface ProductHeroProps {
  product: Product
  brandName: string | null
  colorName?: string | null
  allMedia: string[]
  videoCount: number
  imageAltTexts: Array<string | null | undefined>
  displayPrice: number
  basePrice: number
  discountedPrice: number | null
  onImageClick: (index: number) => void
  onDetailsClick: () => void
}

export function ProductHero({
  product,
  brandName,
  colorName,
  allMedia,
  videoCount,
  imageAltTexts,
  displayPrice,
  basePrice,
  discountedPrice,
  onImageClick,
  onDetailsClick,
}: ProductHeroProps) {
  const modelName = product.model?.trim() || product.name
  const displayColorName = colorName || product.color?.trim() || null
  const renderMedia = (index: number, className: string, priority = false) => {
    const mediaUrl = allMedia[index]
    const isVideo = index < videoCount

    if (isVideo) {
      return <video src={mediaUrl} className={className} autoPlay muted loop playsInline />
    }

    const alt =
      imageAltTexts[index - videoCount] ||
      generateAltText({ brand: brandName, productName: product.name, imageIndex: index })

    return (
      <ProductImageZoom
        src={mediaUrl || "/placeholder.svg"}
        alt={alt}
        className={className}
        priority={priority}
        onClick={() => onImageClick(index)}
      />
    )
  }

  const restMedia = allMedia.slice(2)

  return (
    <div className="w-full">
      {/* Hero image — dominant, full-bleed square */}
      <div className="relative w-full aspect-square bg-[#F5F5F5] overflow-hidden">
        {allMedia.length > 0 && renderMedia(0, "w-full h-full object-cover", true)}
      </div>

      {/* Title / Details / Price */}
      <div className="max-w-xl mx-auto px-6 py-10 lg:py-14 text-center">
        {brandName && (
          <p className="text-[11px] tracking-[0.25em] uppercase text-black mb-3">{brandName}</p>
        )}

        <h1 className="text-4xl lg:text-4xl font-medium tracking-[0.1em] uppercase text-black text-balance">
          {modelName}
        </h1>

        {displayColorName && (
          <p className="text-sm text-zinc-500 tracking-wide mt-2 mb-10 text-center">{displayColorName}</p>
        )}
        {!displayColorName && <div className="mb-10" />}

        <button
          onClick={onDetailsClick}
          className="inline-flex flex-col items-center gap-2 mx-auto mb-10 text-[11px] tracking-[0.2em] uppercase text-black hover:opacity-70 transition-opacity"
        >
          <span>See Details</span>
          <span className="w-full h-px bg-black" />
        </button>

        <div className="flex items-baseline justify-center gap-3">
          <p className="text-base tracking-wide font-normal">EUR {formatPrice(displayPrice)}</p>
          {discountedPrice != null && (
            <p className="text-sm tracking-wide text-zinc-500 line-through font-normal">
              EUR {formatPrice(basePrice)}
            </p>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-1.5 tracking-wide">(VAT included)</p>
      </div>

      {/* Remaining images — dominant placement */}
      {allMedia.length > 1 && (
        <>
          {/* Mobile: every image full-width 1:1 square, stacked with no gaps */}
          <div className="flex flex-col lg:hidden">
            {allMedia.slice(1).map((_, i) => {
              const index = i + 1
              return (
                <div key={index} className="w-full aspect-square bg-[#F5F5F5] overflow-hidden">
                  {renderMedia(index, "w-full h-full object-cover")}
                </div>
              )
            })}
          </div>

          {/* Desktop: large second image + 2-col grid for the rest */}
          <div className="hidden lg:flex lg:flex-col gap-px">
            <div className="w-full aspect-[16/9] bg-[#F5F5F5] overflow-hidden">
              {renderMedia(1, "w-full h-full object-cover")}
            </div>

            {restMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-px">
                {restMedia.map((_, i) => {
                  const index = i + 2
                  return (
                    <div key={index} className="w-full aspect-square bg-[#F5F5F5] overflow-hidden">
                      {renderMedia(index, "w-full h-full object-cover")}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
