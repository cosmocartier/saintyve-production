"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { gsap } from "gsap"
import { useWishlist } from "@/contexts/wishlist-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function WishlistSidebar() {
  const { items, isOpen, closeWishlist, toggleLike } = useWishlist()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Animate sidebar in
      gsap.to(sidebarRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      })
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        pointerEvents: "auto",
      })
    } else {
      // Animate sidebar out
      gsap.to(sidebarRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power2.in",
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        pointerEvents: "none",
      })
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 opacity-0 pointer-events-none"
        onClick={closeWishlist}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white z-50 shadow-2xl transform translate-x-full"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-sm font-medium tracking-widest uppercase">WISHLIST ({items.length})</h2>
            <button
              onClick={closeWishlist}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-gray-500 mb-4 tracking-wide">YOUR WISHLIST IS EMPTY</p>
                <Button
                  onClick={closeWishlist}
                  className="bg-black text-white hover:bg-gray-800 text-xs tracking-widest uppercase px-8 py-3"
                >
                  CONTINUE SHOPPING
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                    <Link href={`/products/${item.slug}`} onClick={closeWishlist} className="flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover bg-gray-50"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`} onClick={closeWishlist}>
                          <h3 className="text-sm font-medium tracking-wide hover:text-gray-500 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{item.price}</p>
                      </div>
                      <button
                        onClick={() => toggleLike(item)}
                        className="text-xs text-gray-500 hover:text-black transition-colors uppercase tracking-widest text-left"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <Link href="/products" onClick={closeWishlist}>
                <Button className="w-full bg-black text-white hover:bg-gray-800 text-xs tracking-widest uppercase py-6 rounded-none">
                  VIEW ALL PRODUCTS
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
