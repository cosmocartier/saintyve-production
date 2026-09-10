"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Package, ExternalLink, Gift } from "lucide-react"
import { getTrackingUrl } from "@/lib/utils/tracking"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type OrderItem = {
  id: string
  quantity: number
  price: number
  tracking_number: string | null
  courier: string | null
  products: {
    name: string
    image: string
  } | null
  product_variants: {
    size: string
  } | null
}

type UserOrderDetailsSidebarProps = {
  isOpen: boolean
  onClose: () => void
  orderItems: OrderItem[]
  orderId: string
  orderTotal: number
  orderStatus: string
  pendingCredits: boolean
  shippingAddress: {
    firstName?: string
    lastName?: string
    address?: string
    apartment?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    phone?: string
  } | null
}

export function UserOrderDetailsSidebar({
  isOpen,
  onClose,
  orderItems,
  orderId,
  orderTotal,
  orderStatus,
  pendingCredits,
  shippingAddress,
}: UserOrderDetailsSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isRedeemingCredits, setIsRedeemingCredits] = useState(false)
  const [creditsAwarded, setCreditsAwarded] = useState(false)

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    if (isOpen) {
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

  const handleRedeemCredits = async () => {
    if (isRedeemingCredits || creditsAwarded) return

    if (orderStatus !== "processing" && orderStatus !== "completed") {
      toast({
        title: "Payment Required",
        description: "Credits can only be redeemed once your payment is confirmed.",
        variant: "destructive",
      })
      return
    }

    setIsRedeemingCredits(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to redeem credits.",
          variant: "destructive",
        })
        setIsRedeemingCredits(false)
        return
      }

      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()

      if (fetchError) {
        console.error("[v0] Error fetching profile:", fetchError)
        toast({
          title: "Error",
          description: "Failed to fetch your profile. Please try again.",
          variant: "destructive",
        })
        setIsRedeemingCredits(false)
        return
      }

      const currentCredits = profile?.credits || 0
      const newCredits = currentCredits + 15

      const { error: updateError } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (updateError) {
        console.error("[v0] Error updating credits:", updateError)
        toast({
          title: "Error",
          description: "Failed to award credits. Please try again.",
          variant: "destructive",
        })
        setIsRedeemingCredits(false)
        return
      }

      await supabase.from("orders").update({ pending_credits: false }).eq("id", orderId)

      setCreditsAwarded(true)
      toast({
        title: "Credits Awarded!",
        description: `15 credits have been added to your account. You now have ${newCredits} credits.`,
      })
    } catch (err) {
      console.error("[v0] Error redeeming credits:", err)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeemingCredits(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 z-[99] opacity-0 pointer-events-none"
        onClick={handleOverlayClick}
      />

      {/* Order Details Sidebar */}
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
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
            ORDER #{orderId.slice(0, 8)}
          </span>
          <button
            onClick={onClose}
            className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
          >
            CLOSE
          </button>
        </div>

        {/* Order Items Section */}
        <div className="flex-1 overflow-y-auto relative">
          {orderItems.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium tracking-widest uppercase">
              NO ITEMS FOUND
            </div>
          ) : (
            <div>
              {orderItems.map((item) => (
                <div key={item.id} className="w-full p-[1em] flex gap-[1em] border-b border-white/15">
                  {/* Image Container */}
                  <div className="flex-[1] aspect-square">
                    <img
                      src={item.products?.image || "/placeholder.svg"}
                      alt={item.products?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Container */}
                  <div className="flex-[3] flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <span className="text-white text-sm font-medium tracking-wide">
                          {item.products?.name || "Unknown Product"}
                        </span>
                      </div>
                      {item.product_variants?.size && (
                        <span className="text-white/60 text-xs font-medium tracking-widest uppercase block mb-2">
                          SIZE: {item.product_variants.size}
                        </span>
                      )}

                      {item.tracking_number && item.courier && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-3 h-3 text-white/60" />
                            <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
                              TRACKING
                            </span>
                          </div>
                          <a
                            href={getTrackingUrl(item.courier, item.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 hover:opacity-70 transition-opacity"
                          >
                            <p className="text-white text-xs font-mono underline decoration-white/30 group-hover:decoration-white">
                              {item.tracking_number}
                            </p>
                            <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white" />
                          </a>
                          <p className="text-white/60 text-xs uppercase mt-1">{item.courier}</p>
                        </div>
                      )}
                    </div>

                    {/* Quantity Display */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 border border-white/15 px-3 py-1">
                        <span className="text-white text-xs font-medium tracking-widest">QTY: {item.quantity}</span>
                      </div>
                      <span className="text-white text-xs font-medium tracking-widest">
                        €{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer/Summary Section */}
        {orderItems.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-[1em] border-t border-white/15 bg-black">
            {pendingCredits && !creditsAwarded && (
              <div className="mb-4 pb-4 border-b border-white/15">
                <button
                  onClick={handleRedeemCredits}
                  disabled={isRedeemingCredits || orderStatus === "pending"}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                    orderStatus === "pending"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90 border border-white"
                  }`}
                >
                  
                  {orderStatus === "pending"
                    ? "CREDITS PENDING PAYMENT"
                    : isRedeemingCredits
                      ? "REDEEMING..."
                      : "REDEEM 15 CREDITS"}
                </button>
                {orderStatus === "pending" && (
                  <p className="text-xs text-yellow-300/80 text-center mt-2">Complete payment to redeem credits</p>
                )}
              </div>
            )}

            {creditsAwarded && (
              <div className="mb-4 pb-4 border-b border-white/15">
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30">
                  <Gift className="w-4 h-4 text-green-300" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-green-300">
                    CREDITS AWARDED
                  </span>
                </div>
              </div>
            )}

            {shippingAddress && (
              <div className="mb-4 pb-4 border-b border-white/15">
                <span className="text-white/60 text-xs font-medium tracking-widest uppercase block mb-2">
                  SHIPPING ADDRESS
                </span>
                <div className="text-white text-xs space-y-1">
                  {shippingAddress.firstName && shippingAddress.lastName && (
                    <p className="font-medium">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                  )}
                  {shippingAddress.address && <p>{shippingAddress.address}</p>}
                  {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                  <p>
                    {[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                  {shippingAddress.phone && <p className="mt-2">Phone: {shippingAddress.phone}</p>}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium tracking-widest uppercase">TOTAL</span>
              <span className="text-white text-sm font-medium tracking-widest">€{Number(orderTotal).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
