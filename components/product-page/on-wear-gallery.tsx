"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createBrowserClient } from "@/lib/supabase/client"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface OnWearGalleryProps {
  productId: string
}

interface OnWearImage {
  id: string
  cf_image_id: string
  alt_text: string | null
  sort_order: number
}

// Fixed 6-tile editorial mosaic (3 columns x 4 rows) replicating the reference layout:
//   [ 0  0 ][1]        0 = large top-left     (cols 1-2, rows 1-2)
//   [ 0  0 ][2]        1 = top-right, 2 = mid-right
//   [3][ 4  4 ]        3 = mid-left
//   [5][ 4  4 ]        4 = large bottom-right (cols 2-3, rows 3-4), 5 = bottom-left
// Each small tile is a portrait 4:5 cell; the container aspect keeps that ratio.
const TILE_POSITIONS = [
  "col-start-1 row-start-1 col-span-2 row-span-2", // slot 0 - large
  "col-start-3 row-start-1", // slot 1
  "col-start-3 row-start-2", // slot 2
  "col-start-1 row-start-3", // slot 3
  "col-start-2 row-start-3 col-span-2 row-span-2", // slot 4 - large
  "col-start-1 row-start-4", // slot 5
]

export function OnWearGallery({ productId }: OnWearGalleryProps) {
  const [images, setImages] = useState<OnWearImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOnWearImages = async () => {
      const supabase = createBrowserClient()

      try {
        const { data, error } = await supabase
          .from("product_images_cf")
          .select("id, cf_image_id, alt_text, sort_order")
          .eq("product_id", productId)
          .eq("on_wear", true)
          .order("sort_order", { ascending: true })
          .limit(6)

        if (error) {
          console.error("[On-Wear Gallery] Error fetching images:", error)
          return
        }

        setImages(data || [])
      } catch (error) {
        console.error("[On-Wear Gallery] Exception fetching images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnWearImages()
  }, [productId])

  if (isLoading || images.length === 0) {
    return null
  }

  return (
    <section aria-label="On-wear looks" className="w-full bg-white">
      <div className="mx-auto w-full lg:max-w-2xl">
        <div className="grid aspect-[3/5] grid-cols-3 grid-rows-4 gap-0.5">
          {images.slice(0, 6).map((image, index) => (
            <div key={image.id} className={`relative overflow-hidden bg-[#f5f5f5] ${TILE_POSITIONS[index]}`}>
              <Image
                src={buildCfUrl(image.cf_image_id, "pdp") || "/placeholder.svg"}
                alt={image.alt_text || "On-wear look"}
                fill
                sizes="(min-width: 1024px) 512px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
