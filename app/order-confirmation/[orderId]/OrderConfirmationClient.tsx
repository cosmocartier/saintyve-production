"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Copy, Phone } from "lucide-react"
import StaticNavigation from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import Footer from "@/components/footer"

export default function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
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
        const supabase = createBrowserClient()
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
          const processedItems = itemsData?.map((item) => {
            if (item.products?.product_images && item.product_variants?.color) {
              const colorImages = item.products.product_images
                .filter((img: any) => img.color_name === item.product_variants.color)
                .sort((a: any, b: any) => a.display_order - b.display_order)

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

    toast({
      title: "Great!",
      description: "Please send your payment receipt via WhatsApp to complete the verification.",
    })
  }

  const getEstimatedDeliveryDate = (orderDate: string) => {
    const date = new Date(orderDate)
    date.setDate(date.getDate() + 14)
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
              <p className="text-sm text-zinc-600">Loading your order details...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <StaticNavigation />
        <CartSidebar />
        <div className="min-h-screen bg-[#F7F7F7] pt-32 pb-20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-600">Failed to load your order details.</p>
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
      <div className="min-h-screen bg-[#F7F7F7] pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
          <Card className="mb-8">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>{step1Open ? "Step 1: Order Details" : "Order Details"}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold">Order ID:</p>
                      <p className="text-sm">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Total Amount:</p>
                      <p className="text-sm">EUR {order.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Estimated Delivery Date:</p>
                      <p className="text-sm">{getEstimatedDeliveryDate(order.created_at)}</p>
                    </div>
                    <div>
                      <Button variant="outline" onClick={() => copyToClipboard(order.id, "Order ID")}>
                        {copiedField === "Order ID" ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Copy Order ID
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  {step2Open ? "Step 2: Payment Verification" : "Payment Verification"}
                </AccordionTrigger>
                <AccordionContent ref={setStep2Ref}>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold">Send Payment Receipt:</p>
                      <p className="text-sm">
                        Please send your payment receipt via WhatsApp to complete the verification.
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="default"
                        onClick={() =>
                          window.open(
                            `https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`,
                            "_blank",
                          )
                        }
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Support via WhatsApp
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}
