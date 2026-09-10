import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />

      <StaticNavigation />

      <div className="pt-20">
        <div className="py-8">
          <div className="max-w-[1920px] mx-auto">
            <div className="mb-7 px-4">
              <div className="h-4 w-32 bg-gray-200 animate-pulse mb-6" />
              <div className="w-full h-[1px] bg-black/10" />
            </div>

            <div className="mb-8 px-4">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 w-24 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  {/* 3:4 aspect ratio skeleton matching product cards */}
                  <div className="aspect-[3/4] bg-gray-200 mb-3" />
                  {/* Product name skeleton */}
                  <div className="h-3 bg-gray-200 mb-2 w-3/4" />
                  {/* Price skeleton */}
                  <div className="h-3 bg-gray-200 w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
