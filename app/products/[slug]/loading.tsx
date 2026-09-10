import { StaticNavigation } from "@/components/static-navigation"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Static Navigation */}
      <div className="hidden lg:block">
        <StaticNavigation />
      </div>

      <div className="flex flex-col lg:flex-row lg:pt-[50px]">
        {/* Mobile Image Gallery Skeleton */}
        <div className="w-full lg:hidden">
          <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
          {/* Progress bar placeholder */}
          <div className="h-px bg-gray-200" />
        </div>

        {/* Desktop Image Gallery Skeleton - Left 60% */}
        <div className="hidden lg:block lg:w-[60%]">
          <div className="flex flex-col space-y-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton - Right 40% */}
        <div className="w-full lg:w-[40%] px-6 py-12 lg:px-16 lg:py-20 lg:sticky lg:top-[73px] lg:self-start">
          <div className="max-w-md mx-auto lg:mx-0">
            {/* SKU Skeleton */}
            <div className="mb-12">
              <div className="h-3 w-24 bg-gray-200 animate-pulse mb-6 rounded" />

              {/* Product Name Skeleton */}
              <div className="space-y-3 mb-8">
                <div className="h-7 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-7 w-3/4 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Price Skeleton */}
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            </div>

            {/* Colors Skeleton */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-[50px] h-[50px] bg-gray-200 animate-pulse rounded-sm" />
                ))}
              </div>
            </div>

            {/* Size Skeleton */}
            <div className="mb-12">
              <div className="w-full flex items-center justify-between py-5 border-b border-black/10">
                <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                <div className="flex items-center gap-4">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="mb-12">
              <div className="w-full h-14 bg-gray-200 animate-pulse rounded-sm" />
            </div>

            {/* Description Skeleton */}
            <div className="mb-12">
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mt-4" />
            </div>

            {/* Accordion Sections Skeleton */}
            <div className="space-y-0 border-t border-black/10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-black/10">
                  <div className="w-full flex items-center justify-between py-6">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section Skeleton */}
      <div className="w-full mt-16">
        <div className="lg:px-8 py-0 px-2.5">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8 mt-12" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
              <div className="px-2 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
