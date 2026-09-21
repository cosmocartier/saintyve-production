"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"

interface ChanelClientProps {
  initialProducts: Product[]
}

// Unique subcategory header images for the mobile image-led layout.
// Add a URL here to show an image for that section. Leave a section out
// (or set it to undefined) to render no image at all for that section —
// there is no fallback to a product's own image.
const SECTION_IMAGES: Record<string, string | undefined> = {
  "Maxi Flap Bags": "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/5866ee5a-d99b-4c12-e35e-c2a96e008e00/w=800",
  Tote: undefined,
  Shopper: undefined,
  Vanity: undefined,
}

export function ChanelClient({ initialProducts }: ChanelClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("chanelScrollPosition")

    if (savedScrollPosition) {
      const scrollY = Number.parseInt(savedScrollPosition, 10)

      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          behavior: "instant" as ScrollBehavior,
        })
      })

      sessionStorage.removeItem("chanelScrollPosition")
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("chanelScrollPosition", window.scrollY.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // "Chanel 25" — models that contain the standalone token "25"
  // (matches "25 Mini", "25 Small Handbag", "25 Large Handbag" but not "22 Mini Handbag")
  const chanel25 = products.filter((product) => /\b25\b/.test(product.model || ""))

  // "Maxi Flap Bags" — models that contain "Flap Bag"
  const flapBags = products.filter((product) => /flap bag/i.test(product.model || ""))

  // "Tote Bags" — models that contain the standalone token "Tote"
  const totes = products.filter((product) => /\btote\b/i.test(product.model || ""))

  // "Shopper Bags" — models that contain the standalone token "Shopper"
  const shoppers = products.filter((product) => /\bshopper\b/i.test(product.model || ""))

  // "Vanity Cases" — models that contain the standalone token "Vanity"
  const vanities = products.filter((product) => /\bvanity\b/i.test(product.model || ""))

  const sections = [
    { title: "Chanel 25", items: chanel25, href: "/brands/chanel/25" },
    { title: "Maxi Flap Bags", items: flapBags, href: "/brands/chanel/flap-bags" },
    { title: "Tote", items: totes, href: "/brands/chanel/tote" },
    { title: "Shopper", items: shoppers, href: "/brands/chanel/shopper" },
    { title: "Vanity", items: vanities, href: "/brands/chanel/vanity" },
  ]
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      ...section,
      image: SECTION_IMAGES[section.title],
    }))

  return (
    <>
      <div className="bg-white py-[0]">
        <div className="w-full max-w-[1920px] mx-auto">
          {sections.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.title} className="mb-12 lg:mb-16">
                {/* Mobile: subcategory names are never shown. When a section has an
                    image, present it exactly like the landing page hero (centered
                    300px column, 3:4 frame), with no label underneath. When a
                    section has no image at all, render nothing so the grid
                    continues with zero extra whitespace. */}
                <div className="lg:hidden">
                  {section.image ? (
                    <Link href={section.href} className="group flex w-full flex-col items-center px-4 pt-6 pb-6">
                      <div className="relative w-full max-w-[300px] aspect-[3/4] overflow-hidden bg-muted">
                        <img
                          src={section.image || "/placeholder.svg"}
                          alt={section.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                  ) : null}
                </div>

                {/* Desktop: unchanged text-only header */}
                <h2 className="hidden lg:block text-center py-8 lg:py-10">
                  <Link
                    href={section.href}
                    className="text-base font-semibold tracking-[0.25em] uppercase text-black transition-opacity hover:opacity-60"
                  >
                    {section.title}
                  </Link>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[1px] lg:gap-x-1 gap-y-5 my-2.5">
                  {section.items.map((product, index) => (
                    <div
                      key={product.id}
                      className={`${index === 0 ? "col-span-2 lg:col-span-1" : ""} ${index >= 5 ? "hidden lg:block" : ""}`}
                    >
                      <ProductCard
                        product={product}
                        hidePrice
                        emphasizedTitle
                        preloadSecondImage
                        aspectRatio="4/5"
                        hideColorInTitle
                        showVariantDetails
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  )
}
