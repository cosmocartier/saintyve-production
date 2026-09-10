export default function SneakersLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      {/* Navigation placeholder */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/10 z-50 animate-pulse" />

      <div className="pt-20">
        {/* Category Title + Divider */}
        <div className="border-b border-black/10">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="h-8 w-48 bg-black/5 animate-pulse" />
          </div>
        </div>

        {/* Category Tabs Row */}
        <div className="border-b border-black/10 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-12 w-24 bg-black/5 animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* SEO Intro Text */}
        <div className="container mx-auto px-4 lg:px-8 pt-12 pb-8">
          <div className="max-w-3xl space-y-3">
            <div className="h-4 bg-black/5 animate-pulse w-full" />
            <div className="h-4 bg-black/5 animate-pulse w-5/6" />
            <div className="h-4 bg-black/5 animate-pulse w-4/6" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 lg:px-8 pb-8">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-8">
              <div className="h-6 w-32 bg-black/5 animate-pulse" />
              <div className="h-6 w-32 bg-black/5 animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-black/5 animate-pulse" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4 lg:px-8 pb-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-6 lg:gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-black/5 animate-pulse" />
                <div className="h-4 bg-black/5 animate-pulse w-3/4" />
                <div className="h-4 bg-black/5 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
