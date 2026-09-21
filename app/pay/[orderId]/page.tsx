import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isPaidOrBeyond } from "@/lib/orders/status"
import { createMolliePayment } from "./actions"
import PayClient from "./PayClient"

const BANK_DETAILS = {
  beneficiary: process.env.BANK_BENEFICIARY_NAME || "Wladislav Weber",
  bankName: process.env.BANK_NAME || "Revolut Bank UAB",
  iban: process.env.BANK_IBAN || "LT41 3250 0102 4758 0724",
  swift: process.env.BANK_SWIFT_BIC || "REVOLT21",
}

const PAYPAL_DETAILS = {
  email: process.env.PAYPAL_EMAIL || "payments@designerdrip.store",
}

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "971528079266"
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@designerdrip.store"

export default async function PayPage({ params }: { params: { orderId: string } }) {
  const supabase = await createClient()
  const { orderId } = params

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-black mb-2">Order not found</h1>
          <p className="text-sm text-zinc-600 mb-4">The order you're looking for doesn't exist.</p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Return home
          </a>
        </div>
      </div>
    )
  }

  const now = new Date()
  const reservedUntil = order.reserved_until ? new Date(order.reserved_until) : null

  // If order is expired and still pending, cancel it
  if (reservedUntil && now >= reservedUntil && order.status === "pending" && order.status !== "cancelled") {
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: now.toISOString(),
        cancel_reason: "reservation_expired",
        updated_at: now.toISOString(),
      })
      .eq("id", orderId)

    // Re-fetch to get updated status
    const { data: updatedOrder } = await supabase.from("orders").select("*").eq("id", orderId).single()
    if (updatedOrder) {
      order.status = updatedOrder.status
    }
  }

  // Show expired screen if cancelled due to expiry
  if (order.status === "cancelled") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-black mb-2">Reservation expired</h1>
          <p className="text-sm text-zinc-600 mb-6">
            This payment window has ended. Please restart checkout to place your order again.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="inline-block px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Return to Homepage
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 border border-zinc-300 text-black rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    )
  }

  // If order is already processing (payment marked as paid) or completed, redirect to confirmation
  if (order.status === "processing" || order.status === "completed") {
    redirect(`/order-confirmation/${orderId}`)
  }

  if (isPaidOrBeyond(order.status)) {
    redirect(`/order-confirmation/${orderId}`)
  }

  // Mollie is a redirect-based online payment: send the customer straight to the
  // hosted checkout instead of rendering the manual bank/PayPal instructions page.
  if (order.payment_method === "mollie" && order.status === "pending") {
    const molliePayment = await createMolliePayment(orderId)

    if (molliePayment.success && molliePayment.checkoutUrl) {
      redirect(molliePayment.checkoutUrl)
    }

    if ((molliePayment as { alreadyPaid?: boolean }).alreadyPaid) {
      redirect(`/order-confirmation/${orderId}`)
    }

    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <h1 className="text-xl font-medium text-black mb-2">Unable to start payment</h1>
          <p className="text-sm text-zinc-600 mb-6">
            {molliePayment.error || "Something went wrong while starting your payment. Please try again."}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/pay/${orderId}`}
              className="inline-block px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Try again
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 border border-zinc-300 text-black rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Fetch order items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(`
      id,
      quantity,
      price,
      product_id,
      products (
        name
      )
    `)
    .eq("order_id", orderId)

  const formattedItems =
    orderItems?.map((item: any) => ({
      id: item.id,
      title: item.products?.name || "Product",
      quantity: item.quantity,
      price: item.price,
    })) || []

  const paymentReference = order.id.slice(0, 8).toUpperCase()

  return (
    <PayClient
      order={{
        id: order.id,
        status: order.status || "pending",
        currency: order.currency || "EUR",
        total_amount: order.total_amount || order.total || 0,
        customer_email: order.customer_email || "",
        payment_reference: paymentReference,
        reserved_until: order.reserved_until || null,
        payment_method: order.payment_method || "",
        created_at: order.created_at,
      }}
      orderItems={formattedItems}
      bankDetails={BANK_DETAILS}
      paypalDetails={PAYPAL_DETAILS}
      whatsappNumber={WHATSAPP_NUMBER}
      supportEmail={SUPPORT_EMAIL}
    />
  )
}
