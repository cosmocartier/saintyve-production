"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import useSWR from "swr"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

// ---------------------------------------------------------------------------
// Data configuration
// Each entry has a package photo (the unboxing image) and a product ID.
// The product name + main image are fetched live from the database.
// ---------------------------------------------------------------------------

interface PackageEntry {
  id: string
  /** Unboxing / package photo URL */
  src: string
  alt: string
  aspectRatio: number // height / width
  /** Supabase product ID to look up name + image */
  productId: string
}

const PACKAGE_ENTRIES: PackageEntry[] = [
  {
    id: "1",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/2eb87bee-1114-4285-4f2a-6cc84133ff00/public",
    alt: "Customer package unboxing",
    aspectRatio: 1.33,
    productId: "a05925f2-5d38-4556-980d-7032d4861dd9",
  },
  {
    id: "2",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/3ca7824c-8dc6-4b5f-3433-3e77a15dc300/public",
    alt: "Luxury bag delivery",
    aspectRatio: 1.5,
    productId: "5ca09779-8d5c-4dfe-b664-3d04152458f4",
  },
  {
    id: "3",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/8a43708b-cb8d-414f-498f-8157ea154e00/public",
    alt: "Package with tissue paper",
    aspectRatio: 1.25,
    productId: "REPLACE_WITH_PRODUCT_ID_3",
  },
  {
    id: "4",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/7a812fb2-0f7c-4a0c-a0f9-93db664d6b00/public",
    alt: "Sneaker delivery unboxing",
    aspectRatio: 1.1,
    productId: "REPLACE_WITH_PRODUCT_ID_4",
  },
  {
    id: "5",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/e5f6a7b8-c9d0-1234-efab-234567890100/public",
    alt: "Branded packaging detail",
    aspectRatio: 1.4,
    productId: "REPLACE_WITH_PRODUCT_ID_5",
  },
  {
    id: "6",
    src: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/f6a7b8c9-d0e1-2345-fabc-345678901200/public",
    alt: "Watch delivery with box",
    aspectRatio: 1.2,
    productId: "REPLACE_WITH_PRODUCT_ID_6",
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ProductData {
  id: string
  name: string
  slug: string
  imageUrl: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function useProducts(ids: string[]): Map<string, ProductData> {
  const key = ids.filter((id) => !id.startsWith("REPLACE_")).join(",")
  const { data } = useSWR<{ products: any[] }>(
    key ? `/api/masonry-products?ids=${encodeURIComponent(key)}` : null,
    fetcher
  )

  const map = new Map<string, ProductData>()
  if (!data?.products) return map

  data.products.forEach((p: any) => {
    // Resolve the main image the same way as new-arrivals page
    let imageUrl = ""
    if (p.use_cloudflare_images && p.cf_images?.length) {
      imageUrl = buildCfUrl(p.cf_images[0].cf_image_id, "grid")
    } else if (p.product_images?.length) {
      const sorted = [...p.product_images].sort(
        (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
      )
      imageUrl = sorted[0].url || ""
    }
    map.set(p.id, { id: p.id, name: p.name, slug: p.slug, imageUrl })
  })

  return map
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => [])
  items.forEach((item, i) => columns[i % columnCount].push(item))
  return columns
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function PackageCard({
  entry,
  product,
  index,
}: {
  entry: PackageEntry
  product: ProductData | undefined
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-white"
    >
      {/* Package image */}
      <div
        className="w-full overflow-hidden bg-zinc-50"
        style={{ paddingBottom: `${entry.aspectRatio * 100}%`, position: "relative" }}
      >
        <img
          src={entry.src}
          alt={entry.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f4f4f4'/%3E%3C/svg%3E"
          }}
        />
      </div>

      {/* Product info */}
      {product && (
        <div className="px-3 pt-2.5 pb-3 flex items-center gap-2.5">
          {/* Product thumbnail */}
          {product.imageUrl && (
            <div className="w-8 h-8 rounded-sm overflow-hidden bg-zinc-50 flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Product name → navigates to product page */}
          <Link
            href={`/products/${product.slug}`}
            className="text-[11px] text-zinc-800 tracking-wide leading-tight line-clamp-2 hover:underline underline-offset-2"
          >
            {product.name}
          </Link>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function CustomerPackagesMasonry() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })

  const productMap = useProducts(PACKAGE_ENTRIES.map((e) => e.productId))

  return (
    <section ref={sectionRef} className="bg-white py-16 lg:py-24 overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-12 mb-8 lg:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">Real customers</p>
          <h2 className="text-[22px] lg:text-[28px] font-light tracking-tight text-zinc-900 leading-tight">
            Every order, handled with care.
          </h2>
        </motion.div>
      </div>

      {/* Masonry grid */}
      {isInView && (
        <>
          {/* Mobile: 2 columns */}
          <div className="sm:hidden flex gap-px">
            {distributeIntoColumns(PACKAGE_ENTRIES, 2).map((col, ci) => (
              <div key={ci} className="flex-1 flex flex-col gap-px">
                {col.map((entry, i) => (
                  <PackageCard
                    key={entry.id}
                    entry={entry}
                    product={productMap.get(entry.productId)}
                    index={ci + i * 2}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tablet: 3 columns */}
          <div className="hidden sm:flex md:hidden gap-px">
            {distributeIntoColumns(PACKAGE_ENTRIES, 3).map((col, ci) => (
              <div key={ci} className="flex-1 flex flex-col gap-px">
                {col.map((entry, i) => (
                  <PackageCard
                    key={entry.id}
                    entry={entry}
                    product={productMap.get(entry.productId)}
                    index={ci + i * 3}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Desktop: 4 columns */}
          <div className="hidden md:flex gap-px">
            {distributeIntoColumns(PACKAGE_ENTRIES, 4).map((col, ci) => (
              <div key={ci} className="flex-1 flex flex-col gap-px">
                {col.map((entry, i) => (
                  <PackageCard
                    key={entry.id}
                    entry={entry}
                    product={productMap.get(entry.productId)}
                    index={ci + i * 4}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
