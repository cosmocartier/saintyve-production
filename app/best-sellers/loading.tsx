import { StaticNavigation } from "@/components/static-navigation"

export default function BestSellersLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <StaticNavigation />

      <div className="pt-20 py-8">
        <div className="max-w-[1920px] mx-auto">
          {/* Category Title */}
          <div className="mb-7 px-4">
            <div className="h-5 w-40 bg-gray-200 animate-pulse mb-6" />
            <div className="w-full h-[1px] bg-black/10" />
          </div>

          {/* Category Tabs */}
          <div className="mb-8 px-4">
            <div className="flex gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-5 w-24 bg-gray-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* SEO Intro */}
          <div className="mb-10 px-4 max-w-4xl">
            <div className="h-4 w-full max-w-2xl bg-gray-200 animate-pulse" />
          </div>

          {/* Filters */}
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="px-4">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
