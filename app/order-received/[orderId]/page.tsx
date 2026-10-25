import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { isManualOrder } from "@/lib/checkout-mode"

export const metadata: Metadata = {
  title: "Order Received | Saint Yve",
  robots: { index: false, follow: false },
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function OrderReceivedPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params

  if (!UUID_PATTERN.test(orderId)) notFound()

  const supabase = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_name, payment_status")
    .eq("id", orderId)
    .single()

  if (!order) notFound()

  // Orders that went through Mollie keep using the payment-aware confirmation page.
  if (!isManualOrder(order)) redirect(`/order-confirmation/${order.id}`)

  const firstName = order.customer_name?.trim().split(/\s+/)[0]
  const reference = order.id.slice(0, 8).toUpperCase()

  return (
    <>
      <StaticNavigation />
      <CartSidebar />
      <main className="min-h-screen bg-white pt-28 pb-24 md:pt-36">
        <article className="mx-auto max-w-[560px] px-6 md:px-0">
          <p className="mb-10 text-[10px] uppercase tracking-[0.28em] text-zinc-400">
            Order Request <span className="tabular-nums">#{reference}</span>
          </p>

          <h1 className="mb-12 text-balance text-[30px] font-light leading-[1.15] tracking-[0.01em] text-black md:text-[40px]">
            {firstName ? `Thank you, ${firstName}.` : "Thank you."}
          </h1>

          <div className="space-y-6 text-[14px] leading-[1.85] text-zinc-600 md:text-[15px]">
            <p>
              Thank you for your order. The pieces in our collection are in high demand, and we want to ensure that your
              selected item is available before finalizing your order.
            </p>
            <p>
              Our team will contact you via WhatsApp or email within the next 24 hours to confirm availability and
              explain the next steps.
            </p>
            <p>At Saint Yve, service, transparency, and authenticity are at the heart of everything we do.</p>
            <p>Thank you for your patience and for choosing Saint Yve.</p>
          </div>

          <div className="mt-14 border-t border-zinc-200 pt-8">
            <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-black">Saint Yve</p>
          </div>

          <Link
            href="/"
            className="mt-12 inline-block text-[11px] uppercase tracking-[0.2em] text-zinc-500 underline decoration-zinc-300 underline-offset-[6px] transition-colors hover:text-black hover:decoration-black"
          >
            Continue browsing
          </Link>
        </article>
      </main>
    </>
  )
}
