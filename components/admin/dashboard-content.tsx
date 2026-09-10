"use client"

import { Package, DollarSign, Clock, CreditCard, Building2, AlertTriangle } from "lucide-react"
import { usePriceMode } from "@/contexts/price-mode-context"
import { Separator } from "@/components/ui/separator"

interface DashboardContentProps {
  orders: any[]
  recentOrders: any[]
}

function DashCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={["rounded-2xl border border-white/8 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]", className].join(" ")}
      style={{ backgroundColor: "#151515" }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
        {index} — {label}
      </p>
      <Separator className="bg-white/6" />
    </div>
  )
}

export function DashboardContent({ orders, recentOrders }: DashboardContentProps) {
  const { useRetailPrice, togglePriceMode } = usePriceMode()

  const processedOrders = orders.filter((o) => o.status === "processing" || o.status === "processed")
  const pendingOrders = orders.filter((o) => o.status === "pending")

  const totalProcessedOrders = processedOrders.length
  const totalPendingPayments = pendingOrders.length

  const totalRevenue = processedOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)

  const paypalRevenue = processedOrders
    .filter((o) => o.payment_method === "paypal")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0)

  const bankRevenue = processedOrders
    .filter((o) => o.payment_method === "bank_transfer")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0)

  const outstandingReceivables = pendingOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  const averageOrderValue = totalProcessedOrders > 0 ? totalRevenue / totalProcessedOrders : 0

  return (
    <div className="space-y-10 pb-16">
      {/* Hero header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
            Overview
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-sans text-[26px] font-light uppercase tracking-[0.1em] text-white sm:text-[32px]">
              Admin Dashboard
            </h1>
            <p className="font-sans text-[13px] font-light tracking-wide text-white/40">
              Real-time overview of your store performance.
            </p>
          </div>
          <button
            onClick={togglePriceMode}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
              useRetailPrice ? "border-white/30 bg-white/20" : "border-white/10 bg-white/5"
            }`}
            role="switch"
            aria-checked={useRetailPrice}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white/80 transition-transform ${
                useRetailPrice ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/20">
          Restricted access. Admin data.
        </p>
      </div>

      {/* Section A: Operational Snapshot */}
      <section aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="sr-only">Operational Snapshot</h2>
        <div className="space-y-4">
          <SectionLabel index="A" label="Operational Snapshot" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DashCard>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-white/30" />
                </div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Processed Orders
                </p>
                <p className="font-sans text-[28px] font-light text-white/90">{totalProcessedOrders}</p>
              </div>
            </DashCard>

            <DashCard>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-white/30" />
                </div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Pending Payments
                </p>
                <p className="font-sans text-[28px] font-light text-white/90">{totalPendingPayments}</p>
              </div>
            </DashCard>

            <DashCard>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-white/30" />
                </div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Total Revenue
                </p>
                <p className="font-sans text-[22px] font-light text-white/90">EUR {totalRevenue.toFixed(2)}</p>
              </div>
            </DashCard>

            <DashCard>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-white/30" />
                </div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  PayPal Revenue
                </p>
                <p className="font-sans text-[22px] font-light text-white/90">EUR {paypalRevenue.toFixed(2)}</p>
              </div>
            </DashCard>

            <DashCard>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-white/30" />
                </div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Bank Revenue
                </p>
                <p className="font-sans text-[22px] font-light text-white/90">EUR {bankRevenue.toFixed(2)}</p>
              </div>
            </DashCard>
          </div>
        </div>
      </section>

      {/* Section B: Revenue Breakdown */}
      <section aria-labelledby="revenue-heading">
        <h2 id="revenue-heading" className="sr-only">Revenue Breakdown</h2>
        <div className="space-y-4">
          <SectionLabel index="B" label="Revenue Breakdown" />
          <DashCard className="space-y-0 p-0">
            {[
              { label: "Total Revenue", value: `EUR ${totalRevenue.toFixed(2)}` },
              { label: "Outstanding Receivables", value: `EUR ${outstandingReceivables.toFixed(2)}` },
              { label: "PayPal Revenue", value: `EUR ${paypalRevenue.toFixed(2)}` },
              { label: "Bank Revenue", value: `EUR ${bankRevenue.toFixed(2)}` },
              { label: "Avg Order Value", value: `EUR ${averageOrderValue.toFixed(2)}` },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                    {row.label}
                  </p>
                  <p className="font-sans text-[13px] font-light text-white/70">{row.value}</p>
                </div>
                {i < arr.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))}
          </DashCard>
        </div>
      </section>

      {/* Section C: Needs Attention */}
      <section aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="sr-only">Needs Attention</h2>
        <div className="space-y-4">
          <SectionLabel index="C" label="Needs Attention" />
          <DashCard>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-8">
                <div className="space-y-1">
                  <p className="font-sans text-[22px] font-light text-white/90">{totalPendingPayments}</p>
                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                    Pending Payments
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-[22px] font-light text-white/30">0</p>
                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
                    Delayed Shipments
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-[22px] font-light text-white/30">0</p>
                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
                    Active Disputes
                  </p>
                </div>
              </div>
            </div>
          </DashCard>
        </div>
      </section>

      {/* Section D: Recent Orders */}
      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="sr-only">Recent Orders</h2>
        <div className="space-y-4">
          <SectionLabel index="D" label="Recent Orders" />
          <DashCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="px-6 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Order ID
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Customer
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Date
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Payment
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Total
                    </th>
                    <th className="px-4 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Processing
                    </th>
                    <th className="px-6 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const processingTime =
                      (order.status === "processed" || order.status === "processing") &&
                      order.updated_at &&
                      order.created_at
                        ? Math.floor(
                            (new Date(order.updated_at).getTime() - new Date(order.created_at).getTime()) /
                              (1000 * 60 * 60),
                          )
                        : null

                    return (
                      <tr key={order.id} className="border-b border-white/6 transition-colors hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-sans text-[11px] font-medium tracking-wide text-white/60">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-4 font-sans text-[11px] font-light text-white/55">
                          {order.profiles?.full_name || order.profiles?.email || "Guest"}
                        </td>
                        <td className="px-4 py-4 font-sans text-[11px] font-light text-white/35">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 font-sans text-[11px] font-light text-white/35">
                          {order.payment_method === "paypal"
                            ? "PayPal"
                            : order.payment_method === "bank_transfer"
                              ? "Bank Transfer"
                              : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em] ${
                              order.status === "processed"
                                ? "border-white/12 bg-white/5 text-white/60"
                                : order.status === "processing"
                                  ? "border-white/10 bg-white/4 text-white/45"
                                  : "border-white/8 bg-white/3 text-white/30"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-sans text-[11px] font-light text-white/55">
                          EUR {Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 font-sans text-[11px] font-light text-white/35">
                          {processingTime !== null ? `${processingTime}h` : "—"}
                        </td>
                        <td className="px-6 py-4 font-sans text-[11px] font-light text-white/25">—</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>
      </section>
    </div>
  )
}
