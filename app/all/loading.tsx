import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"

export default function AllItemsLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <div className="py-8">
          <div className="max-w-[1920px] mx-auto">
            {/* Category Navigation Skeleton */}
            <div className="mb-7 px-4">
              <div className="h-5 w-24 bg-gray-200 animate-pulse mb-6" />
              <div className="w-full h-[1px] bg-black/10" />
            </div>

            {/* Category Tabs Skeleton */}
            <div className="mb-8 px-4">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-5 w-24 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>

            {/* SEO Intro Skeleton */}
            <div className="mb-10 px-4 max-w-4xl">
              <div className="h-4 w-full bg-gray-200 animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
            </div>

            {/* Filters Skeleton */}
            <div className="mb-8 px-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-8">
                  <div className="h-5 w-40 bg-gray-200 animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="px-2 lg:px-4">
                  <div className="aspect-[3/4] bg-gray-200 animate-pulse mb-3" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
