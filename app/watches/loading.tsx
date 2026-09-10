export default function WatchesLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      {/* Navigation placeholder */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-20 animate-pulse" />

      <div className="pt-20 py-8">
        <div className="max-w-[1920px] mx-auto">
          {/* Title and divider */}
          <div className="mb-7 px-4">
            <div className="h-5 w-32 bg-gray-200 animate-pulse mb-6" />
            <div className="w-full h-[1px] bg-gray-200 animate-pulse" />
          </div>

          {/* Category tabs skeleton */}
          <div className="mb-8 px-4">
            <div className="flex gap-6">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-5 w-24 bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* SEO intro paragraph skeleton */}
          <div className="mb-10 px-4 max-w-4xl space-y-3">
            <div className="h-3 bg-gray-200 animate-pulse w-full" />
            <div className="h-3 bg-gray-200 animate-pulse w-[95%]" />
            <div className="h-3 bg-gray-200 animate-pulse w-[90%]" />
          </div>

          {/* Filters skeleton */}
          <div className="mb-8 px-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 bg-gray-200 animate-pulse" />
              <div className="flex items-center gap-8">
                <div className="h-5 w-32 bg-gray-200 animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-3" />
                <div className="space-y-2 px-2">
                  <div className="h-3 bg-gray-200 w-3/4" />
                  <div className="h-3 bg-gray-200 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
