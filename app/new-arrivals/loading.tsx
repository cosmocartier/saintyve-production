export default function NewArrivalsLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      {/* Navigation Skeleton */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50" />

      <div className="pt-20">
        <div className="py-8">
          <div className="max-w-[1920px] mx-auto">
            {/* Category Navigation Skeleton */}
            <div className="mb-7 px-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse mb-6" />
              <div className="w-full h-[1px] bg-black/10" />
            </div>

            {/* Category Tabs Skeleton */}
            <div className="mb-8 px-4">
              <div className="flex gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-6 w-20 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>

            {/* SEO Intro Skeleton */}
            <div className="mb-10 px-4 max-w-4xl">
              <div className="h-5 w-3/4 bg-gray-200 animate-pulse" />
            </div>

            {/* Filters Skeleton */}
            <div className="mb-8 px-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-32 bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-8">
                  <div className="h-10 w-40 bg-gray-200 animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full">
                  {/* Product Image Skeleton */}
                  <div className="relative w-full aspect-[3/4] bg-gray-200 animate-pulse" />
                  {/* Product Details Skeleton */}
                  <div className="bg-white pt-4 pb-6 px-2">
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse mb-2" />
                    <div className="h-4 w-1/4 bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
