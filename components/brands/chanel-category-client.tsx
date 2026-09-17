"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "../products/product-card"
import type { Product } from "@/lib/types/product"

interface ChanelCategoryClientProps {
  initialProducts: Product[]
  title: string
}

export function ChanelCategoryClient({ initialProducts, title }: ChanelCategoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  return (
    <div className="bg-white py-[0]">
      <div className="w-full max-w-[1920px] mx-auto">
        <section className="mb-12 lg:mb-16">
          <h2 className="text-center text-sm lg:text-base tracking-[0.25em] uppercase text-black py-8 lg:py-10">
            {title}
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-16 px-8">
              <p className="text-gray-400 text-sm tracking-widest uppercase">NO PRODUCTS FOUND</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[1px] lg:gap-x-1 gap-y-5 my-2.5">
              {products.map((product) => (
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
          )}
        </section>
      </div>
    </div>
  )
}
