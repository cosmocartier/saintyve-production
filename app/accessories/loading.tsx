export default function AccessoriesLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Placeholder */}
      <div className="h-20 border-b border-gray-100" />

      <div className="pt-8 pb-16">
        <div className="max-w-[1920px] mx-auto">
          {/* Category Title */}
          <div className="mb-7 px-4">
            <div className="h-5 w-32 bg-gray-100 animate-pulse mb-6" />
            <div className="w-full h-[1px] bg-gray-100" />
          </div>

          {/* Category Tabs */}
          <div className="mb-8 px-4">
            <div className="flex gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-4 w-24 bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>

          {/* SEO Intro Block */}
          <div className="mb-10 px-4 max-w-4xl">
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 animate-pulse" />
              <div className="h-3 bg-gray-100 animate-pulse w-5/6" />
              <div className="h-3 bg-gray-100 animate-pulse w-4/6" />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8 px-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-32 bg-gray-100 animate-pulse" />
              <div className="flex items-center gap-8">
                <div className="h-8 w-40 bg-gray-100 animate-pulse" />
                <div className="h-5 w-24 bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-2">
                {/* Image placeholder with 3:4 aspect ratio */}
                <div className="relative w-full pb-[133.33%] bg-gray-100 animate-pulse mb-3" />
                {/* Product name */}
                <div className="h-4 bg-gray-100 animate-pulse mb-2" />
                {/* Price */}
                <div className="h-3 bg-gray-100 animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
