"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/contexts/cart-context"
import { trackCheckoutAttempt } from "@/lib/checkout-attempts"
import gsap from "gsap"
import { Plus, Minus } from "lucide-react"

const WHATSAPP_PHONE_NUMBER = "971528079266"

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCart()
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
    const totalItems = cartSnapshot.reduce((total, item) => total + item.quantity, 0)
    const totalAmount = getSubtotal()

    const lines: string[] = ["Hey Saint Yve Team!", "", "I'd like to place the following order:", ""]

    cartSnapshot.forEach((item) => {
      lines.push(`• ${item.quantity}x ${item.name}`)
      if (item.color) {
        lines.push(`Color: ${item.color}`)
      }
      if (item.variant) {
        lines.push(`Size: ${item.variant}`)
      }
      lines.push(item.quantity > 1 ? `Price: ${item.price} each` : `Price: ${item.price}`)
      if (item.slug) {
        lines.push(`Product URL: ${origin}/products/${item.slug}`)
      }
      lines.push("")
    })

    lines.push("---")
    lines.push("")
    lines.push("ORDER SUMMARY")
    lines.push("")
    lines.push(`Total Items: ${totalItems}`)
    lines.push(`Total: EUR ${totalAmount.toFixed(2)}`)
    lines.push("")
    lines.push("---")
    lines.push("")
    lines.push("Please let me know the next steps regarding payment and shipping.")
    lines.push("")
    lines.push("Thank you!")

    const message = lines.join("\n")
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`

    // Record the checkout attempt. This is intentionally fire-and-forget: tracking must never
    // delay or block the WhatsApp redirect, and any failure here is only logged, not surfaced
    // to the customer — the WhatsApp checkout must always proceed.
    trackCheckoutAttempt({ items: cartSnapshot, origin, whatsappUrl }).catch((err) => {
      console.error("[v0] trackCheckoutAttempt failed:", err)
    })

    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
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
        <div className="flex items-center justify-between p-[1em] border-b border-white/15">
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">BAG</span>
          <button
            onClick={closeCart}
            className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
          >
            CLOSE
          </button>
        </div>

        {/* Cart Items Section */}
        <div className="flex-1 overflow-y-auto relative">
          {items.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium tracking-widest uppercase">
              YOUR BAG IS EMPTY
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.variant || "default"}`}
                  className="w-full p-[1em] flex gap-[1em] border-b border-white/15"
                >
                  {/* Image Container */}
                  <div className="flex-[1] aspect-square">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Container */}
                  <div className="flex-[3] flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-white text-sm font-medium tracking-wide">{item.name}</span>
                        <span className="text-white text-sm font-medium tracking-wide">{item.price}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {item.color && (
                          <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
                            Color: {item.color}
                          </span>
                        )}
                        {item.variant && (
                          <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
                            Size: {item.variant}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 border border-white/15 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-white hover:text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-xs font-medium tracking-widest min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                          className="text-white hover:text-white/70 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-white text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer/Summary Section */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-[1em] border-t border-white/15 bg-black">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-medium tracking-widest uppercase">SHIPPING</span>
              <span className="text-white text-xs font-medium tracking-widest uppercase">AT CHECKOUT</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-medium tracking-widest uppercase">SUBTOTAL</span>
              <span className="text-white text-sm font-medium tracking-wide">EUR {getSubtotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleDiscussAndOrder}
              className="w-full h-[52px] flex items-center justify-center px-6 rounded-none bg-white text-black cursor-pointer hover:bg-zinc-200 transition-colors active:scale-[0.99]"
            >
              <span className="text-[11px] font-medium tracking-[0.18em] uppercase">DISCUSS &amp; ORDER IT NOW</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar
