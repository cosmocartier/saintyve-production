import { StaticNavigation } from "@/components/static-navigation"

export default function JacketsLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <StaticNavigation />

      <div className="pt-20">
        <div className="py-8">
          <div className="max-w-[1920px] mx-auto">
            {/* Title and divider */}
            <div className="mb-7 px-4">
              <div className="h-5 w-24 bg-gray-200 animate-pulse mb-6" />
              <div className="w-full h-[1px] bg-gray-200" />
            </div>

            {/* Category tabs */}
            <div className="mb-8 px-4">
              <div className="flex gap-6 overflow-x-auto">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-4 w-20 bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>

            {/* SEO intro paragraph */}
            <div className="mb-10 px-4 max-w-4xl">
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-200 animate-pulse" />
              </div>
            </div>

            {/* Filters section */}
            <div className="mb-8 px-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-8">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 lg:gap-x-1 gap-y-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-2">
                  {/* Product image skeleton with 3:4 aspect ratio */}
                  <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse mb-3" />
                  {/* Product name skeleton */}
                  <div className="h-3 w-3/4 bg-gray-200 animate-pulse mb-2" />
                  {/* Product price skeleton */}
                  <div className="h-3 w-1/3 bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
