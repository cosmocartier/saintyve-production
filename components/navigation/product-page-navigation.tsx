"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { MobileMenu } from "@/components/mobile-menu"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import Image from "next/image"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

export function ProductPageNavigation() {
  const { openCart, getItemCount } = useCart()
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isHoveringNav, setIsHoveringNav] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setHasScrolled(currentScrollY > 10)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      setTotalResults(0)
      return
    }

    setIsSearching(true)

    try {
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images(url, display_order)
        `,
          { count: "exact" },
        )
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      // Fetch Cloudflare images for products that use them
      const productsWithCf = data?.filter((p: any) => p.use_cloudflare_images) || []
      const cfProductIds = productsWithCf.map((p: any) => p.id)

      const cfImagesMap = new Map<string, any[]>()

      if (cfProductIds.length > 0) {
        const { data: cfImages } = await supabase
          .from("product_images_cf")
          .select("*")
          .in("product_id", cfProductIds)
          .order("sort_order", { ascending: true })

        if (cfImages) {
          cfImages.forEach((img: any) => {
            if (!cfImagesMap.has(img.product_id)) {
              cfImagesMap.set(img.product_id, [])
            }
            cfImagesMap.get(img.product_id)!.push({
              url: buildCfUrl(img.cf_image_id, "grid"),
              display_order: img.sort_order,
            })
          })
        }
      }

      // Combine regular and CF images
      const productsWithImages =
        data?.map((product) => {
          let imageUrl = "/placeholder.svg"

          if (product.use_cloudflare_images) {
            const cfImages = cfImagesMap.get(product.id)
            if (cfImages && cfImages.length > 0) {
              imageUrl = cfImages[0].url
            }
          } else if (product.product_images && product.product_images.length > 0) {
            const sortedImages = product.product_images.sort(
              (a: any, b: any) => a.display_order - b.display_order
            )
            imageUrl = sortedImages[0]?.url || "/placeholder.svg"
          }

          return {
            ...product,
            image_url: imageUrl,
          }
        }) || []

      setSearchResults(productsWithImages)
      setTotalResults(count || 0)
    } catch (error) {
      console.error("[v0] Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <header
      className="md:hidden fixed top-0 z-50 w-full h-12 px-5 bg-white/75 backdrop-blur-md"
      onMouseEnter={() => setIsHoveringNav(true)}
      onMouseLeave={() => setIsHoveringNav(false)}
    >
      <div className="h-full flex items-center justify-between">
        <div className="z-10">
          <MobileMenu hasScrolled={hasScrolled || isSearchOpen || isHoveringNav} />
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 z-10">
          <img
            src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/3f1e744f-a4ff-401e-2c88-7e0fb1661200/w=800"
            alt="SAINT YVE"
            className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex items-center gap-3.5 z-10">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="relative">
            <Image
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/6339efe4-83f2-48c0-a09d-5e0adb3f6f00/iconmobile"
              alt="Search"
              width={14}
              height={14}
              className="cursor-pointer opacity-100 hover:opacity-70 transition-opacity"
            />
          </button>
          <div className="relative">
            <Image
              src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/9a2f7cad-25c0-41eb-b3d8-c63ac6393300/iconmobile"
              alt="Shopping Bag"
              width={14}
              height={14}
              className="cursor-pointer opacity-100 hover:opacity-70 transition-opacity"
              onClick={openCart}
            />
            {getItemCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center bg-black text-white">
                {getItemCount()}
              </span>
            )}
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 flex items-center gap-3 border-b border-gray-300 pb-1">
                <Image
                  src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/6339efe4-83f2-48c0-a09d-5e0adb3f6f00/iconmobile"
                  alt="Search"
                  width={14}
                  height={14}
                  className="opacity-40"
                />
                <input
                  type="text"
                  placeholder="SEARCH FOR PRODUCTS..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none text-black placeholder-gray-400 uppercase tracking-wider font-medium"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="p-2 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {isSearching && (
              <div className="text-center py-8 text-sm text-gray-500 uppercase tracking-wider">Searching...</div>
            )}

            {!isSearching && searchQuery && searchResults.length > 0 && (
              <>
                <div className="mb-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[10px] font-medium uppercase tracking-wider text-black mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-600 font-mono">${product.price?.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {totalResults > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      href={`/all?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery("")
                        setSearchResults([])
                      }}
                      className="inline-block px-6 py-2 bg-black text-white text-[10px] font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      View All {totalResults} Results →
                    </Link>
                  </div>
                )}
              </>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-500 uppercase tracking-wider">
                No products found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
