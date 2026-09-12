"use client"

import useSWR from "swr"
import { useRef } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types/product"

interface CollectionShowcaseProps {
  title: string
  collection?: string
  brand?: string
  category?: string
  parentProduct?: string
  limit?: number
  seeMoreLink?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CollectionShowcase({
  title,
  collection,
  brand,
  category,
  parentProduct,
  limit = 4,
  seeMoreLink,
}: CollectionShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const apiUrl = parentProduct
    ? `/api/collection?parentProduct=${encodeURIComponent(parentProduct)}&limit=${limit}`
    : brand
      ? `/api/collection?brand=${encodeURIComponent(brand)}${category ? `&category=${encodeURIComponent(category)}` : ""}&limit=${limit}`
      : `/api/collection?collection=${collection}&limit=${limit}`

  const { data, isLoading } = useSWR<{ products: Product[] }>(apiUrl, fetcher)

  const products = data?.products ?? []

  return (
    <section aria-label={title} className="bg-white">
      {/* Header */}
      <div className="flex items-end justify-between px-4 lg:px-12 pt-16 pb-8 lg:pt-20 lg:pb-10">
        <h2 className="text-[13px] font-normal tracking-[0.18em] uppercase text-black">
          {title}
        </h2>
        {seeMoreLink && (
          <Link
            href={seeMoreLink}
            className="text-[11px] font-normal tracking-[0.12em] uppercase text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
          >
            See more
          </Link>
        )}
      </div>

      {isLoading ? (
        /* Skeleton placeholders while loading */
        <div className="hidden lg:grid lg:grid-cols-4 gap-px">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-40 px-12">
          <p className="text-[12px] text-zinc-400 uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <>
          {/* Desktop: 4-column grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-px">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                disableMobileGallery={true}
                disableHoverEffect={false}
              />
            ))}
          </div>

          {/* Mobile: horizontal scroll showing ~1.5 cards */}
          <div
            ref={scrollRef}
            className="lg:hidden flex overflow-x-auto gap-px scrollbar-hide snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-none w-[68vw] snap-start">
                <ProductCard
                  product={product}
                  disableMobileGallery={true}
                  disableHoverEffect={true}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
