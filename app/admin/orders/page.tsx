"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { OrderDetailsSidebar } from "@/components/admin/order-details-sidebar"
import { CreateOrderModal } from "@/components/admin/create-order-modal"
import { Search, Plus } from "lucide-react"

type Order = {
  id: string
  created_at: string
  status: string
  supplier_status: string | null
  total: number
  payment_method: string | null
  tracking_number: string | null
  courier: string | null
  last_payment_reminder_at: string | null
  payment_reminder_count: number
  shipping_address: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    fullName?: string
    email?: string
  } | null
  profiles: {
    email: string
    full_name: string | null
  } | null
  order_items: Array<{
    quantity: number
    price: number
  }>
  credits_applied?: number
  coupon_code?: string
  discount_amount?: number
}

type OrderItem = {
  id: string
  quantity: number
  price: number
  variant_id: string
  products: {
    id: string
    name: string
    slug: string
    product_images: Array<{
      url: string
      color_name: string | null
      display_order: number
    }>
  } | null
  product_variants: {
    size: string
    color?: string
  } | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [sendingReminders, setSendingReminders] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([])
  const [selectedOrderTotal, setSelectedOrderTotal] = useState<number>(0)
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<{
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [editingTracking, setEditingTracking] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<{ [key: string]: { number: string; courier: string } }>({})
  const [selectedOrderCredits, setSelectedOrderCredits] = useState<number>(0)
  const [selectedOrderCoupon, setSelectedOrderCoupon] = useState<string | null>(null)
  const [selectedOrderDiscount, setSelectedOrderDiscount] = useState<number>(0)
  const supabase = createBrowserClient()

  useEffect(() => {
    console.log("[v0] Orders page: Checking auth and fetching orders...")
    checkAuthAndFetchOrders()

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const checkAuthAndFetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    fetchOrders()
  }

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles (
          email,
          full_name
        ),
        order_items (
          quantity,
          price
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const handleViewOrder = async (orderId: string, orderTotal: number, shippingAddress: any) => {
    console.log("[v0] Opening order sidebar for ID:", orderId)
    console.log("[v0] Order total:", orderTotal, "Shipping address:", shippingAddress)

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("credits_applied, coupon_code, discount_amount")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("[v0] Failed to load order details:", orderError)
    } else {
      console.log("[v0] Order credits/coupon data:", orderData)
      // Calculate the credit amount in euros (credits_applied * 0.89)
      const creditsInEuros = (orderData.credits_applied || 0) * 0.89
      setSelectedOrderCredits(creditsInEuros)
      setSelectedOrderCoupon(orderData.coupon_code)
      setSelectedOrderDiscount(orderData.discount_amount || 0)
    }

    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        id,
        quantity,
        price,
        tracking_number,
        courier,
        variant_id,
        products (
          id,
          name,
          slug
        ),
        product_variants!order_items_variant_id_fkey (
          size,
          color
        )
      `,
      )
      .eq("order_id", orderId)

    console.log("[v0] Order items query result:", { error, data, count: data?.length })

    if (!error && data) {
      const productIds = data.map((item) => item.products?.id).filter(Boolean)
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("product_id, url, color_name, display_order")
        .in("product_id", productIds)
        .order("display_order", { ascending: true })

      const itemsWithImages = data.map((item) => {
        const productImages = imagesData?.filter((img) => img.product_id === item.products?.id) || []
        return {
          ...item,
          products: {
            ...item.products,
            product_images: productImages,
          },
        }
      })

      setSelectedOrderId(orderId)
      setSelectedOrderItems(itemsWithImages as any)
      setSelectedOrderTotal(orderTotal)
      setSelectedShippingAddress(shippingAddress)
      setIsSidebarOpen(true)
      console.log("[v0] Sidebar state set - isOpen:", true, "items count:", data.length)
    } else {
      console.error("[v0] Failed to load order items:", error)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allOrderIds = new Set(orders.map((order) => order.id))
      setSelectedOrderIds(allOrderIds)
    } else {
      setSelectedOrderIds(new Set())
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelection = new Set(selectedOrderIds)
    if (checked) {
      newSelection.add(orderId)
    } else {
      newSelection.delete(orderId)
    }
    setSelectedOrderIds(newSelection)
  }

  const handleSendPaymentReminders = async () => {
    if (selectedOrderIds.size === 0) return

    setSendingReminders(true)

    try {
      const response = await fetch("/api/admin/send-payment-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selectedOrderIds) }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Payment reminders sent for ${result.count} order(s)`)
        await fetchOrders()
        setSelectedOrderIds(new Set())
      } else {
        alert(`Error: ${result.error || "Failed to send reminders"}`)
      }
    } catch (error) {
      console.error("[v0] Error sending payment reminders:", error)
      alert("Failed to send payment reminders")
    } finally {
      setSendingReminders(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order status:", error)
      fetchOrders()
    }
  }

  const updateOrderTracking = async (orderId: string, trackingNumber: string, courier: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ tracking_number: trackingNumber, courier: courier })
      .eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating tracking:", error)
    } else {
      fetchOrders()
      setEditingTracking(null)
      setTrackingData((prev) => {
        const newData = { ...prev }
        delete newData[orderId]
        return newData
      })
    }
  }

  const handleTrackingEdit = (orderId: string, currentTracking: string | null, currentCourier: string | null) => {
    setEditingTracking(orderId)
    setTrackingData({
      ...trackingData,
      [orderId]: {
        number: currentTracking || "",
        courier: currentCourier || "DHL",
      },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-400 border border-red-500/20"
      default:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }
  }

  const getSupplierStatusLabel = (status: string | null) => {
    if (!status) return "Not Started"
    switch (status) {
      case "unprocessed": return "Unprocessed"
      case "preparing": return "Preparing"
      case "in_transit": return "In Transit"
      case "delivered": return "Delivered"
      default: return status
    }
  }

  const getSupplierStatusColor = (status: string | null) => {
    if (!status) return "bg-white/5 text-white/30 border border-white/8"
    switch (status) {
      case "unprocessed": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      case "preparing":   return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      case "in_transit":  return "bg-purple-500/10 text-purple-400 border border-purple-500/20"
      case "delivered":   return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      default:            return "bg-white/5 text-white/30 border border-white/8"
    }
  }

  const formatReminderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB")
  }

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 min-w-0 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management</p>
          <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">Orders</h1>
          <p className="font-sans text-[10px] tracking-wide text-white/30">Manage all customer orders</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/15 transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "pending", "processing", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
                  statusFilter === f
                    ? "bg-white/5 text-white/90 border border-white/10"
                    : "text-white/35 border border-transparent hover:bg-white/[0.03] hover:text-white/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-sans text-[10px] font-medium tracking-[0.16em] uppercase hover:bg-white/90 transition-all flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Order
          </button>
        </div>

        {/* Bulk selection bar */}
        {selectedOrderIds.size > 0 && (
          <div className="mb-4 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/8 flex items-center justify-between">
            <span className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/60">
              {selectedOrderIds.size} order{selectedOrderIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-4">
              <p className="font-sans text-[10px] text-white/25">Only pending orders will receive a reminder</p>
              <button
                onClick={handleSendPaymentReminders}
                disabled={sendingReminders}
                className="px-4 py-2 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sendingReminders ? "Sending..." : "Send Payment Reminder"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={orders.length > 0 && selectedOrderIds.size === orders.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 cursor-pointer accent-white/60"
                    />
                  </th>
                  {["Order ID", "Customer", "Date", "Order Status", "Fulfillment", "Payment", "Total", "Items", "Profit", "Reminder"].map((h) => (
                    <th key={h} className={`px-5 py-3.5 font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 ${h === "Total" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 cursor-pointer accent-white/60"
                        />
                      </td>
                      <td
                        className="px-5 py-4 font-mono text-[11px] text-white/40 cursor-pointer hover:text-white/70 transition-colors"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        #{order.id.slice(0, 8)}
                      </td>
                      <td
                        className="px-5 py-4 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        <p className="font-sans text-[11px] font-medium text-white/80">
                          {order.profiles?.full_name || (order.shipping_address as any)?.fullName || "Guest Order"}
                        </p>
                        <p className="font-sans text-[10px] text-white/30">
                          {order.profiles?.email || (order.shipping_address as any)?.email}
                        </p>
                      </td>
                      <td
                        className="px-5 py-4 font-sans text-[11px] text-white/30 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-2.5 py-1 font-sans text-[9px] tracking-[0.16em] uppercase rounded-full font-medium border-0 cursor-pointer outline-none ${
                            order.status === "completed" ? "bg-emerald-500/10 text-emerald-400"
                            : order.status === "processing" ? "bg-blue-500/10 text-blue-400"
                            : order.status === "cancelled" ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.supplier_status || ""}
                          onChange={(e) => {
                            supabase.from("orders").update({ supplier_status: e.target.value }).eq("id", order.id).then(() => fetchOrders())
                          }}
                          className={`px-2.5 py-1 font-sans text-[9px] tracking-[0.16em] uppercase rounded-full font-medium border-0 cursor-pointer outline-none ${
                            !order.supplier_status ? "bg-white/5 text-white/30"
                            : order.supplier_status === "unprocessed" ? "bg-amber-500/10 text-amber-400"
                            : order.supplier_status === "preparing" ? "bg-blue-500/10 text-blue-400"
                            : order.supplier_status === "in_transit" ? "bg-purple-500/10 text-purple-400"
                            : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          <option value="">Not Started</option>
                          <option value="unprocessed">Unprocessed</option>
                          <option value="preparing">Preparing</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td
                        className="px-5 py-4 font-sans text-[11px] text-white/45 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        {order.payment_method === "paypal" ? "PayPal" : order.payment_method === "bank_transfer" ? "Bank Transfer" : "—"}
                      </td>
                      <td
                        className="px-5 py-4 font-sans text-[11px] font-medium text-white/80 text-right cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        EUR {Number(order.total).toFixed(2)}
                      </td>
                      <td
                        className="px-5 py-4 font-sans text-[11px] text-white/45 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        {order.order_items?.length || 0}
                      </td>
                      <td
                        className="px-5 py-4 font-sans text-[11px] text-white/20 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        —
                      </td>
                      <td
                        className="px-5 py-4 cursor-pointer"
                        onClick={() => handleViewOrder(order.id, order.total, order.shipping_address)}
                      >
                        {order.last_payment_reminder_at ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 font-sans text-[9px] tracking-widest uppercase rounded-full font-medium bg-emerald-500/10 text-emerald-400">
                              Reminded
                            </span>
                            <p className="mt-1 font-sans text-[10px] text-white/25">
                              {formatReminderDate(order.last_payment_reminder_at)}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 font-sans text-[9px] tracking-widest uppercase rounded-full font-medium bg-white/5 text-white/25">
                            Not Sent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        orderItems={selectedOrderItems}
        orderId={selectedOrderId || ""}
        orderTotal={selectedOrderTotal}
        shippingAddress={selectedShippingAddress}
        creditsApplied={selectedOrderCredits}
        couponCode={selectedOrderCoupon}
        discountAmount={selectedOrderDiscount}
      />

      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSuccess={() => {
          fetchOrders()
        }}
      />
    </div>
  )
}
