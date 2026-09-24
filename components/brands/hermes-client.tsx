"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"

interface HermesClientProps {
  initialProducts: Product[]
}

// Add a URL here only when a curated mobile section image is available.
// Sections without an entry intentionally render no image and no header space.
const SECTION_IMAGES: Record<string, string | undefined> = {
  Kelly: undefined,
  Birkin: undefined,
}

export function HermesClient({ initialProducts }: HermesClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("hermesScrollPosition")

    if (savedScrollPosition) {
      const scrollY = Number.parseInt(savedScrollPosition, 10)

      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          behavior: "instant" as ScrollBehavior,
        })
      })

      sessionStorage.removeItem("hermesScrollPosition")
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("hermesScrollPosition", window.scrollY.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const kelly = products.filter((product) => /\bkelly\b/i.test(product.model || ""))
  const birkin = products.filter((product) => /\bbirkin\b/i.test(product.model || ""))

  const sections = [
    { title: "Kelly", items: kelly, href: "/brands/hermes/kelly" },
    { title: "Birkin", items: birkin, href: "/brands/hermes/birkin" },
  ]
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      ...section,
      image: SECTION_IMAGES[section.title],
    }))

  return (
    <div className="bg-white py-[0]">
      <div className="w-full max-w-[1920px] mx-auto">
        {sections.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.title} className="mb-12 lg:mb-16">
              <div className="lg:hidden">
                {section.image ? (
                  <Link href={section.href} className="group flex w-full flex-col items-center px-4 pt-6 pb-16">
                    <div className="relative w-full max-w-[300px] aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                ) : null}
              </div>

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
                      product={product as any}
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
  )
}

export default HermesClient
