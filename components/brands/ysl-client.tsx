"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"

interface YSLClientProps {
  initialProducts: Product[]
}

export function YSLClient({ initialProducts }: YSLClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("yslScrollPosition")

    if (savedScrollPosition) {
      const scrollY = Number.parseInt(savedScrollPosition, 10)

      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          behavior: "instant" as ScrollBehavior,
        })
      })

      sessionStorage.removeItem("yslScrollPosition")
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("yslScrollPosition", window.scrollY.toString())
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return (
    <>
      <div className="bg-white py-[0]">
        <div className="w-full max-w-[1920px] mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[1px] lg:gap-x-1 gap-y-5 my-2.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} hidePrice emphasizedTitle preloadSecondImage />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
