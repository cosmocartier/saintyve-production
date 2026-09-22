"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { isPaidOrBeyond } from "@/lib/orders/status"

type OrderItem = {
  id: string
  quantity: number
  price: number
  products: {
    name: string
    product_images: {
      url: string
      display_order: number
      color_name: string
    }[]
  } | null
  product_variants: {
    size: string
    color: string | null
  } | null
}

type Order = {
  id: string
  created_at: string
  status: string
  payment_method: string
  total_amount: number
  subtotal_amount: number
  discount_amount: number
  coupon_code: string | null
  customer_name: string
  customer_email: string
  shipping_address: any
}

// How long we poll the order row for a webhook-driven status change
// before falling back to a manual re-check via the Mollie API.
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 20000

const CANCELLED_STATUSES = new Set(["cancelled"])

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const pollStartRef = useRef<number | null>(null)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchOrder = async () => {
    const supabase = createClient()

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !orderData) {
      console.error("[v0] Order fetch error:", orderError)
      setError(true)
      setLoading(false)
      return null
    }

    setOrder(orderData)

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products (
          name,
          product_images (
            url,
            display_order,
            color_name
          )
        ),
        product_variants (
          size,
          color
        )
      `,
      )
      .eq("order_id", orderId)

    if (itemsError) {
      console.error("[v0] Order items fetch error:", itemsError)
    } else {
      const processedItems = itemsData?.map((item) => {
        if (item.products?.product_images && item.product_variants?.color) {
          const colorImages = item.products.product_images
            .filter((img: any) => img.color_name === item.product_variants.color)
            .sort((a: any, b: any) => a.display_order - b.display_order)

          if (colorImages.length > 0) {
            return { ...item, products: { ...item.products, product_images: colorImages } }
          }
        }

        if (item.products?.product_images) {
          const sortedImages = [...item.products.product_images].sort(
            (a: any, b: any) => a.display_order - b.display_order,
          )
          return { ...item, products: { ...item.products, product_images: sortedImages } }
        }

        return item
      })

      setOrderItems(processedItems || [])
    }

    setLoading(false)
    return orderData
  }

  useEffect(() => {
    fetchOrder()
    // eslint-disable-line -- runs once per orderId
  }, [orderId])

  // While the order is still "pending" the Mollie webhook may not have
  // landed yet even though the customer already completed (or abandoned)
  // payment on Mollie's hosted page. Poll the order row for a real status
  // update instead of showing a stale "pending" screen indefinitely.
  useEffect(() => {
    if (!order || order.status !== "pending") {
      setIsVerifying(false)
      return
    }

    setIsVerifying(true)
    pollStartRef.current = Date.now()

    const poll = async () => {
      const elapsed = Date.now() - (pollStartRef.current || Date.now())

      if (elapsed >= POLL_TIMEOUT_MS) {
        // Webhook hasn't landed after a reasonable wait. Route through
        // /pay/[orderId], which re-checks the payment directly with Mollie
        // and settles the order before redirecting back here.
        router.push(`/pay/${orderId}`)
        return
      }

      const updated = await fetchOrder()
      if (updated && updated.status !== "pending") {
        setIsVerifying(false)
        return
      }

      pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }

    pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS)

    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
    // eslint-disable-line -- re-runs only when order.status transitions
  }, [order?.status, orderId, router])

  const getEstimatedDeliveryDate = (orderDate: string) => {
    const date = new Date(orderDate)
    date.setDate(date.getDate() + 14)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <>
        <StaticNavigation />
        <CartSidebar />
        <div className="min-h-screen bg-white pt-32 pb-20">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <StaticNavigation />
        <CartSidebar />
        <div className="min-h-screen bg-white pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-light tracking-[0.15em] uppercase mb-4">Order Not Found</h1>
              <p className="text-[14px] text-zinc-600 mb-8 leading-relaxed">
                We couldn&apos;t find this order. Please check your email for the order confirmation or contact
                support.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-black text-white px-10 h-12 text-[12px] uppercase tracking-[0.15em] hover:bg-zinc-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isPaid = isPaidOrBeyond(order.status)
  const isCancelled = CANCELLED_STATUSES.has(order.status)
  const isPending = order.status === "pending"

  return (
    <>
      <StaticNavigation />
      <CartSidebar />
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8">
          {/* STATUS HERO — reflects the order's real payment status */}
          <div className="bg-[#f7f7f7] py-10 px-6 mb-12 -mx-6 lg:-mx-8">
            <div className="text-center space-y-3 max-w-[520px] mx-auto">
              {isPaid && (
                <>
                  <CheckCircle2 className="w-6 h-6 mx-auto text-black" strokeWidth={1.5} />
                  <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-400">Order Confirmed</p>
                  <h1 className="text-[20px] font-medium tracking-[0.05em] text-black">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-[13px] leading-[1.6] text-zinc-600">
                    A confirmation with your order details has been sent to{" "}
                    <span className="font-medium text-black">{order.customer_email}</span>
                  </p>
                </>
              )}

              {isPending && (
                <>
                  <div className="w-6 h-6 mx-auto border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
                  <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-400">Confirming Payment</p>
                  <h1 className="text-[20px] font-medium tracking-[0.05em] text-black">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-[13px] leading-[1.6] text-zinc-600">
                    {isVerifying
                      ? "We're verifying your payment with Mollie. This usually takes a few seconds."
                      : "Your payment is still being processed."}
                  </p>
                </>
              )}

              {isCancelled && (
                <>
                  <XCircle className="w-6 h-6 mx-auto text-black" strokeWidth={1.5} />
                  <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-400">Payment Unsuccessful</p>
                  <h1 className="text-[20px] font-medium tracking-[0.05em] text-black">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-[13px] leading-[1.6] text-zinc-600">
                    Your payment wasn&apos;t completed and this order has been cancelled. No funds were captured.
                  </p>
                  <div className="pt-3">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center bg-black text-white px-8 h-11 text-[12px] uppercase tracking-[0.15em] hover:bg-zinc-800 transition-colors"
                    >
                      Return to Shop
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {isPaid && (
            <>
              <div className="mb-12">
                <h2 className="text-[13px] uppercase tracking-[0.15em] font-medium text-black border-b border-zinc-200 pb-3 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-6 mb-8">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-6 pb-6 border-b border-zinc-100 last:border-0">
                      <div className="w-20 h-20 bg-zinc-100 flex-shrink-0">
                        <Image
                          src={item.products?.product_images?.[0]?.url || "/placeholder.svg"}
                          alt={item.products?.name || "Product"}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[14px] text-black mb-1">{item.products?.name}</h3>
                        {item.product_variants?.color && (
                          <p className="text-[12px] text-zinc-500">Color: {item.product_variants.color}</p>
                        )}
                        {item.product_variants?.size && (
                          <p className="text-[12px] text-zinc-500">Size: {item.product_variants.size}</p>
                        )}
                        <p className="text-[12px] text-zinc-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] text-black font-medium">
                          EUR {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-200">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-black">EUR {order.subtotal_amount.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-zinc-500">
                        Discount {order.coupon_code && <span className="font-mono">({order.coupon_code})</span>}
                      </span>
                      <span className="text-black">– EUR {order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px]">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="text-black">Free</span>
                  </div>
                  <div className="flex justify-between text-[20px] pt-4 border-t border-zinc-200 font-medium">
                    <span className="text-black">Total</span>
                    <span className="text-black">EUR {order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    <h3 className="text-[12px] uppercase tracking-[0.15em] text-black">Shipping Address</h3>
                  </div>
                  <div className="text-[13px] leading-relaxed space-y-0.5 text-zinc-600">
                    <p className="font-medium text-black">{order.customer_name}</p>
                    <p>{order.shipping_address?.address}</p>
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.postalCode}
                    </p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    <h3 className="text-[12px] uppercase tracking-[0.15em] text-black">Estimated Delivery</h3>
                  </div>
                  <p className="text-[18px] font-light text-black mb-2">
                    {getEstimatedDeliveryDate(order.created_at)}
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Your order will be shipped within 1–2 business days.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="text-center pt-8 border-t border-zinc-200">
            <p className="text-[11px] text-zinc-400 tracking-[0.15em] uppercase mb-2">Need Assistance?</p>
            <p className="text-[13px] text-zinc-600">
              Contact us at{" "}
              <a href="mailto:support@designerdrip.store" className="underline hover:no-underline text-black">
                support@designerdrip.store
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
