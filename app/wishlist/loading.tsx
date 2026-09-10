import { Navigation } from "@/components/navigation"

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navigation />
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200" />
                <div className="h-4 bg-gray-200 w-3/4" />
                <div className="h-4 bg-gray-200 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
