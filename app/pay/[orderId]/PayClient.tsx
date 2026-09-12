"use client"
import { StaticNavigation } from "@/components/static-navigation"
import { useState, useEffect } from "react"
import { Check, Copy, Lock, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { expireOrder, markPaymentComplete } from "./actions"
import { formatCurrency } from "@/lib/utils/payment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PayClientProps {
  order: {
    id: string
    status: string
    currency: string
    total_amount: number
    customer_email: string
    payment_reference: string
    reserved_until: string | null
    payment_method: string
    created_at: string
  }
  orderItems: Array<{
    id: string
    title: string
    quantity: number
    price: number
  }>
  bankDetails: {
    beneficiary: string
    bankName: string
    iban: string
    swift: string
  }
  paypalDetails: {
    email: string
  }
  whatsappNumber: string
  supportEmail: string
}

export default function PayClient({
  order,
  orderItems,
  bankDetails,
  paypalDetails,
  whatsappNumber,
  supportEmail,
}: PayClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [isConfirmPaidOpen, setIsConfirmPaidOpen] = useState(false)
  const [isPaidSuccessOpen, setIsPaidSuccessOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const paymentReference = order.payment_reference || order.id.slice(0, 8).toUpperCase()

  useEffect(() => {
    if (!order.reserved_until) {
      console.log("[v0] No reserved_until found, timer disabled")
      return
    }

    const updateTimer = () => {
      const now = new Date()
      const expiresAt = new Date(order.reserved_until!)
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("00:00")
        expireOrder(order.id).then((result) => {
          if (result.success) {
            router.refresh()
          }
        })
      } else {
        const totalSeconds = Math.floor(diff / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`)
      }
    }

    // Initial update
    updateTimer()

    // Set up interval
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [order.reserved_until, order.id, router])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      description: "Copied to clipboard",
    })
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleMarkAsPaid = () => {
    setIsConfirmPaidOpen(true)
    setSubmitError(null)
  }

  const handleConfirmPaid = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await markPaymentComplete(order.id)

      if (!result.success) {
        setSubmitError(result.error || "Failed to confirm payment")
        setIsSubmitting(false)
        return
      }

      const supportWhatsAppNumber = "971528079266"
      const whatsappMessage = `Hello Saint Yve, I've just paid for my order ${order.id.slice(0, 8).toUpperCase()}.\nAmount: EUR ${order.total_amount.toFixed(2)}\nReference: ${order.id.slice(0, 8).toUpperCase()}\nI'll send my payment receipt now.`

      window.open(`https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`, "_blank")

      // Close confirm dialog and open success modal
      setIsConfirmPaidOpen(false)
      setIsPaidSuccessOpen(true)
      setIsSubmitting(false)
    } catch (error) {
      setSubmitError("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPaidSuccessOpen) {
          setIsPaidSuccessOpen(false)
        }
        if (isConfirmPaidOpen && !isSubmitting) {
          setIsConfirmPaidOpen(false)
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isPaidSuccessOpen, isConfirmPaidOpen, isSubmitting])

  const renderStatusBadge = () => {
    if (order.status === "processing") {
      return (
        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="text-xs font-medium text-emerald-700 tracking-wide">Under Review</span>
        </div>
      )
    }
    return (
      <div className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full">
        <span className="text-xs font-medium text-zinc-600 tracking-wide">Awaiting transfer</span>
      </div>
    )
  }

  return (
    <>
      <StaticNavigation />
      <div className="min-h-screen bg-zinc-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-black mb-2">Complete your payment</h1>
            <p className="text-sm text-zinc-600">Your order is reserved and ready for processing.</p>
          </div>

          {/* Amount Due Card */}
          <div className="mb-8 bg-white border border-zinc-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Amount due</p>
                <p className="text-3xl font-light text-black">{formatCurrency(order.total_amount)}</p>
              </div>
              {timeLeft && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-zinc-700">{timeLeft}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">Order #{order.payment_reference}</p>
            </div>
          </div>

          {/* Payment Details */}
          {order.payment_method === "bank_transfer" ? (
            <div className="mb-8 bg-white border border-zinc-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-zinc-400" />
                <h2 className="text-base font-medium text-black">Manual transfer gateway</h2>
              </div>
              <p className="text-sm text-zinc-600 mb-6">Send the exact amount using the bank details below.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Beneficiary</p>
                    <p className="text-sm font-mono">{bankDetails.beneficiary}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.beneficiary, "beneficiary")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "beneficiary" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">IBAN</p>
                    <p className="text-sm font-mono">{bankDetails.iban}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "iban" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">SWIFT/BIC</p>
                    <p className="text-sm font-mono">{bankDetails.swift}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.swift, "swift")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "swift" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Bank</p>
                    <p className="text-sm font-mono">{bankDetails.bankName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName, "bank")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "bank" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Address</p>
                    <p className="text-sm font-mono">Konstitucijos ave. 21B, 08130, Vilnius, Lithuania</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard("Konstitucijos ave. 21B, 08130, Vilnius, Lithuania", "address")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "address" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Reference (Mandatory)</p>
                    <p className="text-sm font-mono">{paymentReference}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentReference, "reference")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "reference" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : order.payment_method === "paypal" ? (
            <div className="mb-8 bg-white border border-zinc-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-zinc-400" />
                <h2 className="text-base font-medium text-black">PayPal Payment</h2>
              </div>
              <p className="text-sm text-zinc-600 mb-6">Send the exact amount via PayPal.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">PayPal Email</p>
                    <p className="text-sm font-mono">{paypalDetails.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paypalDetails.email, "paypal")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "paypal" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">Amount</p>
                    <p className="text-sm font-mono">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(formatCurrency(order.total_amount), "amount")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "amount" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wide uppercase">
                      Reference (Use your Order Number)
                    </p>
                    <p className="text-sm font-mono">{order.payment_reference}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.payment_reference, "reference")}
                    className="p-2 hover:bg-zinc-50 rounded transition-colors"
                  >
                    {copiedField === "reference" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  After paying, tap 'I've paid' below to notify us.
                </p>
              </div>
            </div>
          ) : null}

          {/* I've Paid Button */}
          <div className="mb-8">
            <button
              onClick={handleMarkAsPaid}
              disabled={order.status === "processing" || order.status === "completed"}
              className="w-full px-6 py-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {order.status === "processing" || order.status === "completed" ? "Payment confirmed" : "I've paid"}
            </button>
          </div>

          {submitError && <p className="mt-2 text-xs text-red-600 text-center">{submitError}</p>}

          {/* Order Summary Accordion */}
          <div className="mb-8">
            <Accordion type="single" collapsible defaultValue="order-summary">
              <AccordionItem value="order-summary" className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <span className="text-sm font-medium text-black">Order summary</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Order ID</span>
                      <span className="font-mono text-black">{order.id.slice(0, 13)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Email</span>
                      <span className="text-black">{order.customer_email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Total</span>
                      <span className="font-medium text-black">{formatCurrency(order.total_amount)}</span>
                    </div>
                    {orderItems.length > 0 && (
                      <div className="pt-3 border-t border-zinc-100">
                        <p className="text-xs text-zinc-500 mb-2 tracking-wide uppercase">Items</p>
                        <div className="space-y-2">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-zinc-700">
                                {item.title} × {item.quantity}
                              </span>
                              <span className="text-black">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t border-zinc-100" />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Support line */}
          <p className="text-center text-xs text-zinc-400">
            Need help?{" "}
            <a
              href="mailto:support@designerdrip.store"
              className="text-zinc-600 underline underline-offset-2 hover:text-black transition-colors"
            >
              Contact us at support@designerdrip.store
            </a>
          </p>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {isConfirmPaidOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setIsConfirmPaidOpen(false)
            }
          }}
        >
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-lg p-8 relative">
            {!isSubmitting && (
              <button
                onClick={() => setIsConfirmPaidOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            )}

            <h2 className="text-xl font-medium text-black mb-3">Confirm payment</h2>
            <p className="text-sm text-zinc-600 mb-6">
              Only click this if you've completed the transfer. We'll verify your payment shortly.
            </p>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmPaid}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Yes, I've paid"}
              </button>
              <button
                onClick={() => setIsConfirmPaidOpen(false)}
                disabled={isSubmitting}
                className="w-full px-6 py-3 border border-zinc-300 text-black rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isPaidSuccessOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPaidSuccessOpen(false)
            }
          }}
        >
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-lg p-8 text-center relative">
            <button
              onClick={() => setIsPaidSuccessOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>

            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-xl font-medium text-black mb-2">Payment marked as sent</h1>
            <p className="text-sm text-zinc-600 mb-6">
              Thanks — we'll verify your payment and update your order status. You can close this window now.
            </p>

            <button
              onClick={() => setIsPaidSuccessOpen(false)}
              className="w-full px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors mb-2"
            >
              Close
            </button>

            <p className="text-xs text-zinc-500">Verification usually happens quickly during business hours.</p>
          </div>
        </div>
      )}
    </>
  )
}
