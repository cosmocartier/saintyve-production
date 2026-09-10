"use client"

import Link from "next/link"
import { Package, ExternalLink } from "lucide-react"

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: string
  order_items?: any[]
}

interface OrdersSectionProps {
  orders: Order[]
  handleOrderClick: (order: Order) => void
  getTrackingUrl: (courier: string, trackingNumber: string) => string
}

export default function OrdersSection({ orders, handleOrderClick, getTrackingUrl }: OrdersSectionProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900">ORDER HISTORY</h2>
          <Link href="/account/orders" className="text-xs tracking-widest uppercase underline hover:text-zinc-600">
            VIEW ALL
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-black/10 p-4 hover:bg-zinc-50 transition-colors">
                <div className="cursor-pointer" onClick={() => handleOrderClick(order)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">
                        ORDER #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 tracking-widest uppercase mb-1">TOTAL</p>
                      <p className="text-sm font-medium">EUR {order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.order_items && order.order_items.some((item: any) => item.tracking_number) && (
                    <div className="mb-3 p-3 bg-zinc-50 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-zinc-500" />
                        <p className="text-xs text-zinc-500 tracking-widest uppercase">TRACKING INFORMATION</p>
                      </div>
                      {order.order_items
                        .filter((item: any) => item.tracking_number)
                        .map((item: any, index: number) => (
                          <div key={index} className="border-t border-black/5 pt-2 first:border-t-0 first:pt-0">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <a
                                  href={getTrackingUrl(item.courier, item.tracking_number)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-sm font-mono hover:underline hover:text-zinc-600 transition-colors inline-flex items-center gap-1 mb-1"
                                >
                                  {item.tracking_number}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <p className="text-xs text-zinc-500 uppercase">{item.courier}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs tracking-wider ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {order.order_items?.length || 0} {order.order_items?.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <span className="text-xs tracking-widest uppercase text-zinc-400 hover:text-black">
                      VIEW DETAILS →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p className="text-sm text-zinc-500 mb-4">No orders yet</p>
            <Link href="/products">
              <button className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14 lg:w-auto lg:px-12">
                START SHOPPING
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
