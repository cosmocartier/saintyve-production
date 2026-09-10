"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Copy } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { updateOrderItemTrackingAction } from "@/app/actions/tracking"
import { markOrderAsShippedAction } from "@/app/actions/mark-shipped"

type OrderItem = {
  id: string
  quantity: number
  price: number
  tracking_number: string | null
  courier: string | null
  products: {
    id?: string
    name: string
    slug?: string // Added slug for product URL
    product_images: Array<{
      url: string
      color_name: string | null
      display_order: number
    }>
  } | null
  product_variants: {
    size: string
    color?: string
  } | null
}

type OrderDetailsSidebarProps = {
  isOpen: boolean
  onClose: () => void
  orderItems: OrderItem[]
  orderId: string
  orderTotal: number
  shippingAddress: {
    fullName?: string
    firstName?: string
    lastName?: string
    email?: string
    address?: string
    apartment?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    phone?: string
  } | null
  orderStatus?: string
  onStatusUpdate?: () => void
  creditsApplied?: number
  couponCode?: string | null
  discountAmount?: number
}

export function OrderDetailsSidebar({
  isOpen,
  onClose,
  orderItems,
  orderId,
  orderTotal,
  shippingAddress,
  orderStatus,
  onStatusUpdate,
  creditsApplied = 0,
  couponCode = null,
  discountAmount = 0,
}: OrderDetailsSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<{ number: string; courier: string }>({
    number: "",
    courier: "DHL",
  })
  const [items, setItems] = useState<OrderItem[]>(orderItems)
  const [isMarkingShipped, setIsMarkingShipped] = useState(false)
  const [shippedError, setShippedError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    console.log("[v0] OrderDetailsSidebar useEffect - orderItems:", orderItems.length)
    setItems(orderItems)
  }, [orderItems])

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    console.log("[v0] OrderDetailsSidebar animation useEffect - isOpen:", isOpen, "items:", items.length)

    if (isOpen) {
      console.log("[v0] Opening order sidebar with GSAP")
      sidebar.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"

      gsap.to(sidebar, {
        x: "0%",
        duration: 0.5,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
      })

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.2,
      })
    } else {
      gsap.to(sidebar, {
        x: "100%",
        duration: 0.5,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
        onComplete: () => {
          sidebar.style.pointerEvents = "none"
        },
      })

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          overlay.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  const handleOverlayClick = () => {
    onClose()
  }

  const handleEditTracking = (itemId: string, currentTracking: string | null, currentCourier: string | null) => {
    setEditingItemId(itemId)
    setTrackingData({
      number: currentTracking || "",
      courier: currentCourier || "DHL",
    })
  }

  const handleSaveTracking = async (itemId: string) => {
    try {
      const carrierCodeMap: Record<string, number | undefined> = {
        DHL: undefined,
        FedEx: undefined,
        UPS: undefined,
        USPS: undefined,
        DPD: undefined,
        Hermes: undefined,
      }

      const carrierCode = carrierCodeMap[trackingData.courier] // will be undefined

      const result = await updateOrderItemTrackingAction({
        orderItemId: itemId,
        trackingNumber: trackingData.number,
        courier: trackingData.courier,
        carrierCode,
      })

      if (!result.success) {
        console.error("[v0] Error saving tracking:", result.error)
        alert(result.error || "Failed to save tracking number")
        return
      }

      console.log("[v0] Successfully saved tracking and synced with 17TRACK")

      // Update local state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, tracking_number: trackingData.number, courier: trackingData.courier } : item,
        ),
      )
      setEditingItemId(null)
      setTrackingData({ number: "", courier: "DHL" })

      alert("Tracking saved & synced to 17TRACK ✅")
    } catch (error) {
      console.error("[v0] Error saving tracking:", error)
      alert("Failed to save tracking number")
    }
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setTrackingData({ number: "", courier: "DHL" })
  }

  const allItemsHaveTracking = () => {
    return items.every((item) => item.tracking_number && item.tracking_number.trim() !== "")
  }

  const handleSetToShipped = async () => {
    if (!allItemsHaveTracking()) {
      setShippedError("Please add tracking numbers to all items before marking as shipped")
      return
    }

    setIsMarkingShipped(true)
    setShippedError(null)

    try {
      const result = await markOrderAsShippedAction({ orderId })

      if (!result.success) {
        setShippedError(result.error || "Failed to mark order as shipped")
        setIsMarkingShipped(false)
        return
      }

      // Success - show confirmation and close
      alert("✅ Order marked as shipped and customer has been notified via email")
      onStatusUpdate?.()
      onClose()
    } catch (error) {
      console.error("[v0] Error marking as shipped:", error)
      setShippedError("An unexpected error occurred")
    } finally {
      setIsMarkingShipped(false)
    }
  }

  const handleCopyAddress = () => {
    const addressText = `${shippingAddress?.fullName || `${shippingAddress?.firstName} ${shippingAddress?.lastName}`}
${shippingAddress?.address}${shippingAddress?.apartment ? "\n" + shippingAddress.apartment : ""}
${shippingAddress?.city}, ${shippingAddress?.state} ${shippingAddress?.postalCode}
${shippingAddress?.country}
${shippingAddress?.phone ? "Phone: " + shippingAddress.phone : ""}`

    navigator.clipboard.writeText(addressText)
  }

  const getProductImage = (item: OrderItem) => {
    if (item.products?.product_images && item.products.product_images.length > 0) {
      const variantColor = item.product_variants?.color

      // If variant has a color, find the first image matching that color
      if (variantColor) {
        const matchingImages = item.products.product_images.filter(
          (img) => img.color_name?.toLowerCase() === variantColor.toLowerCase(),
        )

        if (matchingImages.length > 0) {
          // Return the first image (lowest display_order) for this color
          const sortedImages = [...matchingImages].sort((a, b) => a.display_order - b.display_order)
          return sortedImages[0].url
        }
      }

      // Fallback: return the first image overall
      const sortedImages = [...item.products.product_images].sort((a, b) => a.display_order - b.display_order)
      return sortedImages[0]?.url || "/placeholder.svg"
    }

    return "/placeholder.svg"
  }

  const getProductUrl = (item: OrderItem) => {
    if (item.products?.slug) {
      return `/products/${item.products.slug}`
    }
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-[99] opacity-0 pointer-events-none"
        onClick={handleOverlayClick}
      />

      {/* Order Details Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-[100svh] bg-[#131313] z-[100] flex flex-col pointer-events-none w-[440px] max-[900px]:w-full border-l border-white/8"
        style={{ transform: "translateX(100%)", willChange: "transform" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-white/6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-white/80">
              Order #{orderId.slice(0, 8)}
            </h3>
            <button onClick={onClose} className="font-sans text-[10px] uppercase tracking-[0.16em] text-white/25 hover:text-white/60 transition-colors">
              Close
            </button>
          </div>
          <div className="flex items-center gap-3 font-sans text-[10px] text-white/25">
            <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
            <span>·</span>
            <span>EUR {orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-sans text-[10px] uppercase tracking-widest text-white/20">No items found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-white/[0.03] rounded-xl overflow-hidden border border-white/6">
                      <img
                        src={getProductImage(item) || "/placeholder.svg"}
                        alt={item.products?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      {getProductUrl(item) ? (
                        <a
                          href={getProductUrl(item)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-[11px] font-medium text-white/80 hover:text-white transition-colors mb-1 block"
                        >
                          {item.products?.name || "Unknown Product"}
                        </a>
                      ) : (
                        <h4 className="font-sans text-[11px] font-medium text-white/80 mb-1">
                          {item.products?.name || "Unknown Product"}
                        </h4>
                      )}

                      <div className="space-y-0.5 font-sans text-[10px] text-white/30 mb-3">
                        {item.product_variants?.size && <div>Size: {item.product_variants.size}</div>}
                        {item.product_variants?.color && <div>Color: {item.product_variants.color}</div>}
                        <div>Qty: {item.quantity}</div>
                        <div className="font-medium text-white/60">
                          EUR {(Number(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {editingItemId === item.id ? (
                        <div className="space-y-2 pt-3 border-t border-white/6">
                          <input
                            type="text"
                            placeholder="Tracking number"
                            value={trackingData.number}
                            onChange={(e) => setTrackingData({ ...trackingData, number: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                          />
                          <select
                            value={trackingData.courier}
                            onChange={(e) => setTrackingData({ ...trackingData, courier: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 focus:outline-none focus:border-white/15 transition-colors"
                          >
                            <option value="DHL">DHL</option>
                            <option value="FedEx">FedEx</option>
                            <option value="UPS">UPS</option>
                            <option value="USPS">USPS</option>
                            <option value="DPD">DPD</option>
                            <option value="Hermes">Hermes</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveTracking(item.id)}
                              className="flex-1 px-3 py-1.5 rounded-lg font-sans text-[10px] uppercase tracking-[0.16em] font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 px-3 py-1.5 rounded-lg font-sans text-[10px] uppercase tracking-[0.16em] font-medium border border-white/8 text-white/30 hover:text-white/60 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : item.tracking_number ? (
                        <div className="pt-3 border-t border-white/6">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-sans text-[9px] uppercase tracking-[0.16em] text-white/25">Tracking</span>
                            <button
                              onClick={() => handleEditTracking(item.id, item.tracking_number, item.courier)}
                              className="font-sans text-[10px] text-white/40 hover:text-white/70 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="font-mono text-[11px] text-white/70">{item.tracking_number}</div>
                          <div className="font-sans text-[10px] text-white/25 mt-0.5">{item.courier}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditTracking(item.id, null, null)}
                          className="font-sans text-[10px] text-white/30 hover:text-white/60 transition-colors pt-3 border-t border-white/6 w-full text-left"
                        >
                          + Add Tracking Number
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-white/6 bg-white/[0.02]">
              <h4 className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/25 mb-4">Order Summary</h4>
              <div className="space-y-2 font-sans text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/30">Payment Method</span>
                  <span className="text-white/70 font-medium">{orderStatus === "pending" ? "Bank Transfer" : "PayPal"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Status</span>
                  <span className="text-white/70 font-medium capitalize">{orderStatus || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Items</span>
                  <span className="text-white/70 font-medium">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
                <div className="pt-3 mt-2 border-t border-white/6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/30">Subtotal</span>
                    <span className="text-white/60">EUR {(orderTotal + (creditsApplied || 0) + (discountAmount || 0)).toFixed(2)}</span>
                  </div>
                  {creditsApplied > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Credits Applied</span>
                      <span>-EUR {creditsApplied.toFixed(2)}</span>
                    </div>
                  )}
                  {couponCode && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Coupon ({couponCode})</span>
                      <span>-EUR {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/6">
                    <span className="text-white/80 font-medium">Total</span>
                    <span className="text-white/80 font-medium">EUR {orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {items.length > 0 && shippingAddress && (
            <div className="px-6 py-5 border-t border-white/6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/25">Shipping Address</h4>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 font-sans text-[10px] text-white/25 hover:text-white/60 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div className="font-sans text-[11px] text-white/40 space-y-1">
                {(shippingAddress.fullName || (shippingAddress.firstName && shippingAddress.lastName)) && (
                  <div className="font-medium text-white/70">
                    {shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`}
                  </div>
                )}
                {shippingAddress.address && <div>{shippingAddress.address}</div>}
                {shippingAddress.apartment && <div>{shippingAddress.apartment}</div>}
                <div>{[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(", ")}</div>
                {shippingAddress.country && <div>{shippingAddress.country}</div>}
                {shippingAddress.phone && <div className="mt-2 text-white/30">Phone: {shippingAddress.phone}</div>}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex-shrink-0 px-6 py-5 border-t border-white/6 space-y-2">
            {shippedError && (
              <div className="px-3 py-2 rounded-xl font-sans text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
                {shippedError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button className="px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium uppercase tracking-[0.16em] bg-white/[0.03] border border-white/8 text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all">
                Mark as Processed
              </button>
              <button
                onClick={handleSetToShipped}
                disabled={!allItemsHaveTracking() || isMarkingShipped}
                className="px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium uppercase tracking-[0.16em] bg-white/[0.03] border border-white/8 text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {isMarkingShipped ? "Sending..." : "Mark as Shipped"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium uppercase tracking-[0.16em] border border-white/8 text-white/25 hover:text-white/50 transition-colors">
                Print Invoice
              </button>
              <button className="px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium uppercase tracking-[0.16em] border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-colors">
                Refund Order
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
