"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import Image from "next/image"
import { Check, Mail, MapPin, Calendar } from "lucide-react"

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
  pending_credits: boolean | null
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [step1Open, setStep1Open] = useState(true)
  const [step2Open, setStep2Open] = useState(false)
  const [step2Ref, setStep2Ref] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    console.log("[v0] Order confirmation page loaded for order:", orderId)

    const fetchOrder = async () => {
      try {
        const supabase = createClient()
        console.log("[v0] Fetching order details...")

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (orderError || !orderData) {
          console.error("[v0] Order fetch error:", orderError)
          setError(true)
          setLoading(false)
          return
        }

        console.log("[v0] Order fetched successfully:", orderData)

        if (orderData.status === "pending") {
          console.log("[v0] Order is still pending, redirecting to payment page")
          window.location.href = `/pay/${orderId}`
          return
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
          console.log("[v0] Order items fetched:", itemsData?.length)
          // Process items to get the correct first image for each variant's color
          const processedItems = itemsData?.map((item) => {
            if (item.products?.product_images && item.product_variants?.color) {
              // Filter images by the variant's color and sort by display_order
              const colorImages = item.products.product_images
                .filter((img: any) => img.color_name === item.product_variants.color)
                .sort((a: any, b: any) => a.display_order - b.display_order)

              // If we have color-specific images, use the first one
              if (colorImages.length > 0) {
                return {
                  ...item,
                  products: {
                    ...item.products,
                    product_images: colorImages,
                  },
                }
              }
            }

            // If no color match or no color specified, just sort all images by display_order
            if (item.products?.product_images) {
              const sortedImages = [...item.products.product_images].sort(
                (a: any, b: any) => a.display_order - b.display_order,
              )
              return {
                ...item,
                products: {
                  ...item.products,
                  product_images: sortedImages,
                },
              }
            }

            return item
          })

          setOrderItems(processedItems || [])
        }

        setLoading(false)
      } catch (err) {
        console.error("[v0] Unexpected error:", err)
        setError(true)
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const supportWhatsAppNumber = "971528079266"
  const whatsappMessage = order
    ? `Hello Designerdrip, I've just paid for my order ${order.id.slice(0, 8).toUpperCase()}.\nAmount: EUR ${order.total_amount.toFixed(2)}\nReference: ${order.id.slice(0, 8).toUpperCase()}\nI'll send my payment receipt now.`
    : ""

  const handlePaymentCompleted = () => {
    setStep1Open(false)
    setStep2Open(true)

    setTimeout(() => {
      if (step2Ref) {
        step2Ref.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)

    router.push(`/order-confirmation/${orderId}/receipt`)
  }

  const getEstimatedDeliveryDate = (orderDate: string) => {
    const date = new Date(orderDate)
    date.setDate(date.getDate() + 14) // Add 14 days
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <>
        <StaticNavigation />
        <CartSidebar />
        <div className="min-h-screen bg-[#F7F7F7] pt-32 pb-20">
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
        <div className="min-h-screen bg-[#F7F7F7] pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-light tracking-[0.2em] uppercase mb-4">Order Not Found</h1>
              <p className="text-base text-zinc-600 mb-8">
                We couldn't find this order. Please check your email for the order confirmation or contact support.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-black text-white px-10 py-4 text-xs tracking-[0.15em] uppercase hover:bg-zinc-800 transition-colors rounded-[26px]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <StaticNavigation />
      <CartSidebar />
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-[760px] mx-auto px-6 lg:px-8">
          <div className="bg-[#f7f7f7] py-8 px-6 mb-8 lg:mb-10 -mx-6 lg:-mx-8">
            <div className="text-center space-y-3">
              <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-400">ORDER CONFIRMED</p>
              <h1 className="text-[20px] font-medium tracking-[0.05em] text-black">
                #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-[13px] leading-[1.6] text-zinc-600 max-w-[500px] mx-auto">
                A confirmation with your order details has been sent to{" "}
                <span className="font-medium text-black">{order.customer_email}</span>
              </p>
            </div>
          </div>
          {/* End of confirmation hero */}

          {order.payment_method === "bank_transfer" && (
            <>
              <div className="mb-12 mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-black border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-medium text-white">1</span>
                  </div>
                  <h2 className="text-[18px] font-medium text-black">Complete your payment</h2>
                </div>

                <div className="bg-white border border-[#ECECEC] rounded-lg px-5 py-6 lg:px-10 lg:py-8">
                  <p className="text-[15px] text-[#555] leading-relaxed mb-6">
                    Please transfer{" "}
                    <span className="text-2xl font-light mx-1">EUR {order.total_amount.toFixed(2)}</span> to complete
                    your order
                  </p>

                  <div className="space-y-5 mb-8">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">Bank Name</p>
                        <p className="text-base">Revolut Bank UAB</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("Revolut Bank UAB", "bank")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "bank" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "bank" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">Account Holder</p>
                        <p className="text-base">Wladislav Weber</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("Wladislav Weber", "holder")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "holder" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "holder" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">IBAN</p>
                        <p className="text-base font-mono">LT41 3250 0102 4758 0724</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("LT41 3250 0102 4758 0724", "iban")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "iban" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "iban" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">BIC/SWIFT</p>
                        <p className="text-base font-mono">REVOLT21</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("REVOLT21", "bic")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "bic" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "bic" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">Payment Reference</p>
                        <p className="text-base font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-red-600 mt-2">Please include this reference in your transfer</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.id.slice(0, 8).toUpperCase(), "reference")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "reference" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "reference" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-200">
                    Processing time: 1–3 business days after payment is received.
                  </p>

                  <button
                    onClick={handlePaymentCompleted}
                    className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors tracking-[0.1em] uppercase"
                    disabled={step2Open}
                  >
                    Payment Completed
                  </button>
                </div>
              </div>

              <div ref={setStep2Ref}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      step2Open
                        ? "bg-black border-[1.5px] border-black"
                        : "bg-transparent border-[1.5px] border-[#C7C7C7]"
                    }`}
                  >
                    <span className={`text-[12px] font-medium ${step2Open ? "text-white" : "text-[#C7C7C7]"}`}>2</span>
                  </div>
                  <h2 className={`text-[18px] font-medium ${step2Open ? "text-black" : "text-[#C7C7C7]"}`}>
                    Send your payment receipt
                  </h2>
                </div>

                {step2Open && (
                  <div className="bg-white border border-[#ECECEC] rounded-lg px-6 py-8 lg:px-12 lg:py-10">
                    <p className="text-[15px] text-[#555] leading-relaxed mb-8">
                      Send your payment receipt so we can verify and start processing your order.
                    </p>

                    <a
                      href={`https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors tracking-[0.1em] uppercase"
                    >
                      Send Receipt via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {order.payment_method === "paypal" && (
            <>
              <div className="mb-12 mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-black border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-medium text-white">1</span>
                  </div>
                  <h2 className="text-[18px] font-medium text-black">Complete your payment</h2>
                </div>

                <div className="bg-white border border-[#ECECEC] rounded-lg px-5 py-6 lg:px-10 lg:py-8">
                  <p className="text-[15px] text-[#555] leading-relaxed mb-6">
                    Please send <span className="text-2xl font-light mx-1">EUR {order.total_amount.toFixed(2)}</span> to
                    complete your order
                  </p>

                  <div className="space-y-5 mb-8">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">PayPal Email</p>
                        <p className="text-base">payments@designerdrip.store</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("payments@designerdrip.store", "paypal-email")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "paypal-email" ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        {copiedField === "paypal-email" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">PayPal Username</p>
                        <p className="text-base">@designerdeiner</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard("@designerdeiner", "paypal-username")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "paypal-username" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {copiedField === "paypal-username" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-5">
                      <div>
                        <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-2">Order ID</p>
                        <p className="text-base font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-red-600 mt-2">Please include this in your payment note</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.id.slice(0, 8).toUpperCase(), "paypal-reference")}
                        className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors hover:bg-zinc-100 rounded"
                      >
                        {copiedField === "paypal-reference" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {copiedField === "paypal-reference" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-8">
                    <p className="text-sm text-amber-900 font-medium">
                      ⚠️ Important: Payment must be sent via Friends & Family
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Our system will block payments sent as Goods & Services
                    </p>
                  </div>

                  <p className="text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-200">
                    Processing time: 1–3 business days after payment is received.
                  </p>

                  <button
                    onClick={handlePaymentCompleted}
                    className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors tracking-[0.1em] uppercase"
                    disabled={step2Open}
                  >
                    Payment Completed
                  </button>
                </div>
              </div>

              <div ref={setStep2Ref}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      step2Open
                        ? "bg-black border-[1.5px] border-black"
                        : "bg-transparent border-[1.5px] border-[#C7C7C7]"
                    }`}
                  >
                    <span className={`text-[12px] font-medium ${step2Open ? "text-white" : "text-[#C7C7C7]"}`}>2</span>
                  </div>
                  <h2 className={`text-[18px] font-medium ${step2Open ? "text-black" : "text-[#C7C7C7]"}`}>
                    Send your payment receipt
                  </h2>
                </div>

                {step2Open && (
                  <div className="bg-white border border-[#ECECEC] rounded-lg px-6 py-8 lg:px-12 lg:py-10">
                    <p className="text-[15px] text-[#555] leading-relaxed mb-8">
                      Send your payment receipt so we can verify and start processing your order.
                    </p>

                    <a
                      href={`https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors tracking-[0.1em] uppercase"
                    >
                      Send Receipt via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="border-zinc-300 pt-12 mb-12 border-t">
            <div className="bg-white border border-zinc-200 rounded-lg px-6 py-8 lg:px-12 lg:py-10">
              <h2 className="text-xl font-light tracking-[0.15em] uppercase mb-8">Order Summary</h2>

              <div className="space-y-6 mb-8">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-6 pb-6 border-b border-zinc-200 last:border-0">
                    <div className="w-24 h-24 bg-zinc-100 flex-shrink-0">
                      <Image
                        src={item.products?.product_images?.[0]?.url || "/placeholder.svg"}
                        alt={item.products?.name || "Product"}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-light mb-2">{item.products?.name}</h3>
                      {item.product_variants?.color && (
                        <p className="text-sm text-zinc-500 mb-1">Color: {item.product_variants.color}</p>
                      )}
                      {item.product_variants?.size && (
                        <p className="text-sm text-zinc-500 mb-1">Size: {item.product_variants.size}</p>
                      )}
                      <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base">EUR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-zinc-200">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>EUR {order.subtotal_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Discount {order.coupon_code && <span className="font-mono">({order.coupon_code})</span>}
                    </span>
                    <span>-EUR {order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-light pt-4 border-t border-zinc-200">
                  <span>Total</span>
                  <span>EUR {order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white border border-zinc-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5" />
                <h3 className="text-sm font-light tracking-[0.15em] uppercase">Shipping Address</h3>
              </div>
              <div className="text-sm space-y-1 text-zinc-600">
                <p className="font-medium text-black">{order.customer_name}</p>
                <p>{order.shipping_address?.address}</p>
                {order.shipping_address?.apartment && <p>{order.shipping_address.apartment}</p>}
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.postalCode}
                </p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5" />
                <h3 className="text-sm font-light tracking-[0.15em] uppercase">Estimated Delivery</h3>
              </div>
              <p className="text-2xl font-light mb-3">{getEstimatedDeliveryDate(order.created_at)}</p>
              <p className="text-xs text-zinc-500">
                Your order will be shipped within 1-2 business days after payment confirmation
              </p>
            </div>
          </div>

          <div className="text-center p-8 bg-white border border-zinc-200 rounded-lg">
            <p className="text-xs text-zinc-400 tracking-[0.15em] uppercase mb-3">Need Assistance?</p>
            <p className="text-sm">
              Contact us at{" "}
              <a href="mailto:support@designerdrip.store" className="underline hover:no-underline">
                support@designerdrip.store
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
