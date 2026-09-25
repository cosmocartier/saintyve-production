"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { isPaidOrBeyond } from "@/lib/orders/status"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

type OrderItem = {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    use_cloudflare_images: boolean | null
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
  resolvedImage: string
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

// Formats a numeric amount the same way the cart drawer does: "EUR 1,200.00" —
// thousands separators, always two decimals.
function formatEUR(amount: number): string {
  return `EUR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          id,
          name,
          use_cloudflare_images,
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
      // Resolve each item's product image using the exact same
      // Cloudflare-vs-legacy resolution the Cart Drawer relies on
      // (see components/product-page/product-page-client.tsx): products
      // flagged use_cloudflare_images read from product_images_cf via
      // buildCfUrl(..., "pdp"); everything else falls back to the legacy
      // product_images table, filtered by the purchased variant's color.
      const cfProductIds = Array.from(
        new Set(
          (itemsData || [])
            .filter((item: any) => item.products?.use_cloudflare_images && item.products?.id)
            .map((item: any) => item.products.id),
        ),
      )

      const cfImagesByProduct = new Map<string, { cf_image_id: string; sort_order: number; title_image: boolean }[]>()

      if (cfProductIds.length > 0) {
        const { data: cfImages, error: cfError } = await supabase
          .from("product_images_cf")
          .select("product_id, cf_image_id, sort_order, title_image, role")
          .in("product_id", cfProductIds)
          .not("role", "in", "(category,onwear)")
          .order("sort_order", { ascending: true })

        if (cfError) {
          console.error("[v0] product_images_cf fetch error:", cfError)
        } else {
          cfImages?.forEach((img: any) => {
            if (!cfImagesByProduct.has(img.product_id)) cfImagesByProduct.set(img.product_id, [])
            cfImagesByProduct.get(img.product_id)!.push(img)
          })
        }
      }

      const processedItems = (itemsData || []).map((item: any) => {
        let resolvedImage = "/placeholder.svg"

        if (item.products?.use_cloudflare_images && item.products?.id) {
          const cfImages = cfImagesByProduct.get(item.products.id) || []
          const titleImage = cfImages.find((img) => img.title_image) || cfImages[0]
          if (titleImage) {
            resolvedImage = buildCfUrl(titleImage.cf_image_id, "pdp")
          }
        } else if (item.products?.product_images?.length) {
          const legacyImages = item.products.product_images
          const colorImages = item.product_variants?.color
            ? legacyImages
                .filter((img: any) => img.color_name === item.product_variants.color)
                .sort((a: any, b: any) => a.display_order - b.display_order)
            : []

          const sortedImages =
            colorImages.length > 0
              ? colorImages
              : [...legacyImages].sort((a: any, b: any) => a.display_order - b.display_order)

          if (sortedImages[0]?.url) resolvedImage = sortedImages[0].url
        }

        return { ...item, resolvedImage }
      })

      setOrderItems(processedItems)
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
            <div className="h-6 w-6 animate-spin rounded-full border border-zinc-300 border-t-black" />
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
      <div className="min-h-screen bg-white pt-28 pb-24">
        <div className="max-w-[520px] mx-auto px-6">
          {/* HERO — a quiet confirmation mark, not a success graphic */}
          <div className="text-center pt-8 pb-14">
            {isPaid && (
              <div className="w-6 h-6 mx-auto mb-5 rounded-full border border-black flex items-center justify-center">
                <Check className="w-3 h-3 text-black" strokeWidth={2} />
              </div>
            )}
            {isPending && (
              <div className="w-6 h-6 mx-auto mb-5 rounded-full border border-zinc-300 border-t-black animate-spin" />
            )}
            {isCancelled && (
              <div className="w-6 h-6 mx-auto mb-5 rounded-full border border-black flex items-center justify-center">
                <X className="w-3 h-3 text-black" strokeWidth={2} />
              </div>
            )}

            <p className="text-[10px] tracking-[0.28em] uppercase text-zinc-400 mb-3">
              {isPaid && "Order Confirmed"}
              {isPending && "Confirming Payment"}
              {isCancelled && "Payment Unsuccessful"}
            </p>

            <h1 className="text-[22px] font-medium tracking-[0.06em] text-black mb-4">
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>

            {isPaid && (
              <p className="text-[13px] leading-[1.7] text-zinc-500 max-w-[380px] mx-auto">
                A confirmation with your order details has been sent to{" "}
                <span className="text-black">{order.customer_email}</span>
              </p>
            )}

            {isPending && (
              <p className="text-[13px] leading-[1.7] text-zinc-500 max-w-[380px] mx-auto">
                {isVerifying
                  ? "We're verifying your payment. This usually takes a few seconds."
                  : "Your payment is still being processed."}
              </p>
            )}

            {isCancelled && (
              <>
                <p className="text-[13px] leading-[1.7] text-zinc-500 max-w-[380px] mx-auto mb-6">
                  Your payment wasn&apos;t completed and this order has been cancelled. No funds were captured.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center bg-black text-white px-8 h-11 text-[11px] uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors"
                >
                  Return to Shop
                </Link>
              </>
            )}
          </div>

          {isPaid && (
            <>
              <div className="border-t border-zinc-200" />

              {/* ORDER SUMMARY */}
              <div className="pt-14">
                <h2 className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 mb-6">Order Summary</h2>

                <div>
                  {orderItems.map((item) => {
                    const productName = item.products?.name || "Product"
                    const brandName = productName.split(" ")[0]
                    const modelName = productName.split(" ").slice(1).join(" ") || productName

                    return (
                      <div key={item.id} className="flex gap-5 py-7 border-b border-zinc-100 first:pt-0">
                        <div className="w-[76px] h-[76px] shrink-0 bg-zinc-50 flex items-center justify-center p-2">
                          <img
                            src={item.resolvedImage || "/placeholder.svg"}
                            alt={productName}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 mb-1.5">
                              {brandName}
                            </p>
                            <p className="text-[14px] font-medium text-black leading-snug break-words mb-1.5">
                              {modelName}
                            </p>
                            {item.product_variants?.color && (
                              <p className="text-[12px] text-zinc-500">{item.product_variants.color}</p>
                            )}
                            {item.product_variants?.size && (
                              <p className="text-[12px] text-zinc-500">Size {item.product_variants.size}</p>
                            )}
                            <p className="text-[11px] tracking-[0.1em] text-zinc-400 mt-2">
                              Quantity {String(item.quantity).padStart(2, "0")}
                            </p>
                          </div>

                          <p className="text-[13px] text-black font-medium tabular-nums whitespace-nowrap">
                            {formatEUR(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-7 space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 tracking-[0.05em] uppercase">Subtotal</span>
                    <span className="text-black tabular-nums">{formatEUR(order.subtotal_amount)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-zinc-500 tracking-[0.05em] uppercase">
                        Discount {order.coupon_code && <span className="font-mono">({order.coupon_code})</span>}
                      </span>
                      <span className="text-black tabular-nums">– {formatEUR(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 tracking-[0.05em] uppercase">Shipping</span>
                    <span className="text-black tracking-[0.05em] uppercase">Free</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline">
                    <span className="text-[13px] text-black tracking-[0.08em] uppercase font-medium">Total</span>
                    <span className="text-[17px] text-black font-medium tabular-nums">
                      {formatEUR(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-14" />

              {/* SHIPPING ADDRESS + ESTIMATED DELIVERY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-14">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 mb-4">Shipping Address</h3>
                  <div className="text-[13px] leading-[1.7] space-y-0.5">
                    <p className="text-black font-medium">{order.customer_name}</p>
                    <p className="text-zinc-500">{order.shipping_address?.address}</p>
                    <p className="text-zinc-500">
                      {order.shipping_address?.city}, {order.shipping_address?.postalCode}
                    </p>
                    <p className="text-zinc-500">{order.shipping_address?.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 mb-4">Estimated Delivery</h3>
                  <p className="text-[17px] text-black font-medium mb-2">
                    {getEstimatedDeliveryDate(order.created_at)}
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Your order will be shipped within 1–2 business days.
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-14" />
            </>
          )}

          {/* SUPPORT */}
          <div className={`text-center ${isPaid ? "pt-14" : "pt-8 border-t border-zinc-200"}`}>
            <p className="text-[10px] text-zinc-400 tracking-[0.22em] uppercase mb-2.5">Need Assistance?</p>
            <a
              href="mailto:support@designerdrip.store"
              className="text-[13px] text-black underline decoration-zinc-300 hover:decoration-black underline-offset-4 transition-colors break-all"
            >
              support@designerdrip.store
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
