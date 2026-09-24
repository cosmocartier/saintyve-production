"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart, parseCartPrice } from "@/contexts/cart-context"
import { trackCheckoutAttempt } from "@/lib/checkout-attempts"
import gsap from "gsap"

const WHATSAPP_PHONE_NUMBER = "971528079266"

// Renders a price string (e.g. "EUR 4500.00") with proper thousands formatting: "EUR 4,500.00".
function formatPrice(price: string): string {
  const amount = parseCartPrice(price)
  return `EUR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCart()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    if (isOpen) {
      sidebar.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"

      gsap.to(sidebar, {
        x: "0%",
        duration: 1,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
      })

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
      })
    } else {
      gsap.to(sidebar, {
        x: "100%",
        duration: 1,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
        onComplete: () => {
          sidebar.style.pointerEvents = "none"
        },
      })

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          overlay.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  const handleOverlayClick = () => {
    closeCart()
  }

  const handleDiscussAndOrder = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://designerdrip.com"

    // Snapshot the cart as it is right now, before anything else can change it.
    const cartSnapshot = items

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}`

    // Record the checkout attempt. This is intentionally fire-and-forget: tracking must never
    // delay or block navigation, and any failure here is only logged, not surfaced to the
    // customer — proceeding to checkout must always work.
    trackCheckoutAttempt({ items: cartSnapshot, origin, whatsappUrl }).catch((err) => {
      console.error("[v0] trackCheckoutAttempt failed:", err)
    })

    // Close the drawer before navigating so it doesn't stay stuck open on the checkout page.
    closeCart()
    router.push("/checkout")
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 z-[99] opacity-0 pointer-events-none"
        onClick={handleOverlayClick}
      />

      {/* Cart Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-[100svh] bg-black z-[100] flex flex-col pointer-events-none w-[35%] max-[900px]:w-full"
        style={{
          transform: "translateX(100%)",
          willChange: "transform",
        }}
      >
        {/* Header */}
        <div className="border-b border-white/10">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <span className="text-white text-[11px] font-medium tracking-[0.28em] uppercase">Bag</span>
            <button
              onClick={closeCart}
              className="text-white/45 text-[10px] font-medium tracking-[0.28em] uppercase cursor-pointer hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
          {items.length > 0 && (
            <div className="px-6 pb-4">
              <span className="text-white/35 text-[10px] font-normal tracking-[0.32em] uppercase">
                {String(items.length).padStart(2, "0")} Item{items.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {/* Cart Items Section */}
        <div className="flex-1 overflow-y-auto relative pb-[220px]">
          {items.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60 text-[11px] font-medium tracking-[0.28em] uppercase">
              Your Bag Is Empty
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const brandName = item.name.split(" ")[0]
                const modelName = item.name.split(" ").slice(1).join(" ") || item.name

                return (
                  <div
                    key={`${item.id}-${item.variant || "default"}`}
                    className="w-full px-6 py-8 flex gap-5 border-b border-white/10"
                  >
                    {/* Image Container */}
                    <div className="w-[104px] shrink-0 aspect-square bg-white flex items-center justify-center p-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info Container */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-white/40 text-[10px] font-medium tracking-[0.28em] uppercase mb-1.5">
                            {brandName}
                          </div>
                          <div className="text-white text-sm font-medium leading-snug break-words">{modelName}</div>
                          {item.color && <div className="text-white/45 text-xs mt-1.5">{item.color}</div>}
                          {item.variant && <div className="text-white/45 text-xs mt-0.5">Size {item.variant}</div>}
                        </div>
                        <span className="text-white text-sm font-medium tabular-nums whitespace-nowrap">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1 -ml-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed leading-none"
                          >
                            <span className="text-base">−</span>
                          </button>
                          <span className="text-white text-xs tabular-nums w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-2 text-white/70 hover:text-white transition-colors leading-none"
                          >
                            <span className="text-base">+</span>
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 text-[10px] font-medium tracking-[0.24em] uppercase cursor-pointer hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer/Summary Section */}
        {items.length > 0 && (
          <div
            className="absolute bottom-0 left-0 w-full bg-black border-t border-white/10"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="px-6 pt-5 flex items-center justify-between">
              <span className="text-white/40 text-[10px] font-medium tracking-[0.28em] uppercase">Shipping</span>
              <span className="text-white/40 text-[10px] font-medium tracking-[0.28em] uppercase">At Checkout</span>
            </div>
            <div className="px-6 pt-2 pb-5 flex items-center justify-between">
              <span className="text-white text-xs font-medium tracking-[0.24em] uppercase">Subtotal</span>
              <span className="text-white text-sm font-medium tabular-nums">
                {formatPrice(`EUR ${getSubtotal()}`)}
              </span>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={handleDiscussAndOrder}
                className="w-full h-[52px] flex items-center justify-center bg-white text-black cursor-pointer hover:bg-white/90 transition-colors active:scale-[0.99]"
              >
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase">Discuss &amp; Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar
