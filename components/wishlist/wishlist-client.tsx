"use client"

import { useWishlist } from "@/contexts/wishlist-context"
import { ProductCard } from "@/components/products/product-card"

export function WishlistClient() {
  const { items, toggleLike, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="mb-7 px-4">
            <div className="h-6 bg-gray-200 w-32 mb-6 animate-pulse" />
            <div className="w-full h-[1px] bg-black/10" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                <div className="h-4 bg-gray-200 w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-7 px-4">
          <h1 className="text-[15px] font-normal tracking-[0.15em] mb-6 text-[#111111] uppercase">WISHLIST</h1>
          <div className="w-full h-[1px] bg-black/10" />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-gray-400 text-sm tracking-widest uppercase">YOUR WISHLIST IS EMPTY</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  price:
                    typeof item.price === "string" ? Number.parseFloat(item.price.replace(/[^\d.]/g, "")) : item.price,
                  slug: item.slug,
                  image: item.image,
                  product_images: [
                    {
                      id: `${item.id}-img`,
                      url: item.image,
                      alt_text: item.name,
                      display_order: 0,
                    },
                  ],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
