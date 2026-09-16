"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"

interface ChanelClientProps {
  initialProducts: Product[]
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

  const sections = [
    { title: "Chanel 25", items: chanel25 },
    { title: "Maxi Flap Bags", items: flapBags },
  ].filter((section) => section.items.length > 0)

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
                <h2 className="text-center text-sm lg:text-base tracking-[0.25em] uppercase text-black py-8 lg:py-10">
                  {section.title}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[1px] lg:gap-x-1 gap-y-5 my-2.5">
                  {section.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      hidePrice
                      emphasizedTitle
                      preloadSecondImage
                      aspectRatio="4/5"
                      hideColorInTitle
                    />
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
