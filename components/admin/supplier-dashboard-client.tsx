"use client"

import { useEffect, useState } from "react"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Package, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { OrderDetailsSidebar } from "@/components/admin/order-details-sidebar"

type Order = {
  id: string
  created_at: string
  status: string
  total: number
  payment_method: string | null
  supplier_status: string
  shipping_address: {
    firstName?: string
    lastName?: string
    address?: string
    apartment?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
    fullName?: string // Added fullName for customer name
  } | null
  profiles: {
    email: string
    full_name: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product_id: string
    variant_id: string
    products: {
      name: string
      slug: string // Added slug for product links
      id: string // Added id for product links
    } | null
    product_variants: {
      size: string
      color: string
    } | null
    supplier_price?: number // Added supplier_price for direct access
  }>
  customer_name?: string
  customer_email?: string
  customer_phone?: string
}

type SupplierDashboardClientProps = {
  initialOrders: Order[]
  supplierId: string
  userRole?: string // Add userRole prop
}

export function SupplierDashboardClient({ initialOrders, supplierId, userRole }: SupplierDashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [invoiceName, setInvoiceName] = useState("")
  const [supplierPrices, setSupplierPrices] = useState<Record<string, string>>({})
  const [productPrices, setProductPrices] = useState<Record<string, number>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel("supplier-orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    fetchSupplierPrices()
  }, [])

  const fetchSupplierPrices = async () => {
    const { data } = await supabase
      .from("supplier_product_prices")
      .select("product_id, variant_id, supplier_price")
      .eq("supplier_id", supplierId)

    if (data) {
      const prices: Record<string, number> = {}
      data.forEach((item) => {
        const key = `${item.product_id}-${item.variant_id}`
        prices[key] = item.supplier_price
      })
      setProductPrices(prices)
    }
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
          id,
          quantity,
          price,
          product_id,
          variant_id,
          products (
            name,
            slug,
            id
          ),
          product_variants (
            size,
            color
          ),
          supplier_price // Directly fetch supplier_price
        )
      `,
      )
      .in("status", ["processing", "completed"]) // Only show orders that are processing or completed (not pending)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const totalOrders = orders.length
  const needsAttention = orders.filter((o) => (o.supplier_status || "unprocessed") === "unprocessed").length
  const unprocessed = orders.filter((o) => (o.supplier_status || "unprocessed") === "unprocessed").length
  const processed = orders.filter((o) => {
    const status = o.supplier_status || "unprocessed"
    return status !== "unprocessed"
  }).length

  const unprocessedOrders = orders.filter((o) => (o.supplier_status || "unprocessed") === "unprocessed")

  const handleSelectOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order || (order.supplier_status && order.supplier_status !== "unprocessed")) {
      return
    }

    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === unprocessedOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(unprocessedOrders.map((o) => o.id)))
    }
  }

  const exportToCSV = () => {
    const selectedOrdersData = orders.filter((o) => selectedOrders.has(o.id))

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Postal Code",
      "Country",
      "Product",
      "Size",
      "Color",
      "Quantity",
      "Supplier Price",
      "Product Link",
      "Order Date",
    ]

    const rows = selectedOrdersData.flatMap((order) =>
      order.order_items.map((item) => {
        const customerName = order.shipping_address?.fullName || order.customer_name || "N/A"

        const productLink = item.products?.slug
          ? `${typeof window !== "undefined" ? window.location.origin : ""}/products/${item.products.slug}`
          : item.products?.id
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/products/${item.products.id}`
            : "N/A"

        return [
          order.id.slice(0, 8).toUpperCase(),
          customerName,
          order.customer_phone || order.shipping_address?.phone || "N/A",
          `${order.shipping_address?.address || ""} ${order.shipping_address?.apartment || ""}`.trim(),
          order.shipping_address?.city || "N/A",
          order.shipping_address?.postalCode || "N/A",
          order.shipping_address?.country || "N/A",
          item.products?.name || "N/A",
          item.product_variants?.size || "N/A",
          item.product_variants?.color || "N/A",
          item.quantity,
          `€${Number(item.supplier_price || 0).toFixed(2)}`,
          productLink,
          new Date(order.created_at).toLocaleDateString(),
        ]
      }),
    )

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return { csvContent, selectedOrdersData }
  }

  const handleExport = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select at least one order to export")
      return
    }

    const selectedOrdersData = orders.filter((o) => selectedOrders.has(o.id))
    const hasNonUnprocessed = selectedOrdersData.some(
      (order) => order.supplier_status && order.supplier_status !== "unprocessed",
    )

    if (hasNonUnprocessed) {
      alert("You can only export unprocessed orders. Please deselect orders that have already been processed.")
      return
    }

    const prices: Record<string, string> = {}

    selectedOrdersData.forEach((order) => {
      order.order_items.forEach((item) => {
        const key = `${item.product_id}-${item.variant_id}`
        const savedPrice = productPrices[key]
        if (savedPrice) {
          prices[key] = savedPrice.toString()
        } else {
          prices[key] = ""
        }
      })
    })

    setSupplierPrices(prices)
    setIsExportDialogOpen(true)
  }

  const handlePriceChange = (productId: string, variantId: string, price: string) => {
    const key = `${productId}-${variantId}`
    setSupplierPrices((prev) => ({ ...prev, [key]: price }))
  }

  const canExport = () => {
    const selectedOrdersData = orders.filter((o) => selectedOrders.has(o.id))
    return selectedOrdersData.every((order) =>
      order.order_items.every((item) => {
        const key = `${item.product_id}-${item.variant_id}`
        const price = supplierPrices[key]
        return price && !isNaN(Number.parseFloat(price)) && Number.parseFloat(price) > 0
      }),
    )
  }

  const calculateTotalPrice = () => {
    const selectedOrdersData = orders.filter((o) => selectedOrders.has(o.id))
    let total = 0

    selectedOrdersData.forEach((order) => {
      order.order_items.forEach((item) => {
        const key = `${item.product_id}-${item.variant_id}`
        const price = Number.parseFloat(supplierPrices[key])
        if (price) {
          total += Number.parseFloat(price) * item.quantity
        }
      })
    })

    return total.toFixed(2)
  }

  const handleCreateInvoice = async () => {
    if (!invoiceName.trim()) {
      alert("Please enter an invoice name")
      return
    }

    if (!canExport()) {
      alert("Please enter prices for all products")
      return
    }

    const { csvContent, selectedOrdersData } = exportToCSV()
    const totalPrice = calculateTotalPrice()

    const priceMap = new Map<
      string,
      { supplier_id: string; product_id: string; variant_id: string; supplier_price: number }
    >()

    for (const order of selectedOrdersData) {
      for (const item of order.order_items) {
        const key = `${item.product_id}-${item.variant_id}`
        const price = Number.parseFloat(supplierPrices[key])

        if (!priceMap.has(key)) {
          priceMap.set(key, {
            supplier_id: supplierId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            supplier_price: price,
          })
        }
      }
    }

    const priceUpdates = Array.from(priceMap.values())

    const { error: priceError } = await supabase.from("supplier_product_prices").upsert(priceUpdates, {
      onConflict: "supplier_id,product_id,variant_id",
    })

    if (priceError) {
      console.error("Error saving prices:", priceError)
      alert("Error saving prices: " + priceError.message)
      return
    }

    const enrichedOrdersData = selectedOrdersData.map((order) => ({
      ...order,
      order_items: order.order_items.map((item) => {
        const key = `${item.product_id}-${item.variant_id}`
        return {
          ...item,
          supplier_price: Number.parseFloat(supplierPrices[key]),
        }
      }),
    }))

    const { error: invoiceError } = await supabase.from("supplier_invoices").insert({
      supplier_id: supplierId,
      name: invoiceName,
      total_price: Number.parseFloat(totalPrice),
      order_ids: Array.from(selectedOrders),
      csv_data: enrichedOrdersData, // Use enriched data with supplier prices
    })

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError)
      alert("Failed to create invoice: " + invoiceError.message)
      return
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${invoiceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    link.style.display = "none"
    document.body.appendChild(link)

    // Force download
    link.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

    const { error: updateError } = await supabase
      .from("orders")
      .update({ supplier_status: "preparing", processed_by_supplier: true })
      .in("id", Array.from(selectedOrders))

    if (updateError) {
      console.error("Error updating orders:", updateError)
      alert("Warning: Orders were exported but status update failed")
    }

    setSelectedOrders(new Set())
    setInvoiceName("")
    setSupplierPrices({})
    setIsExportDialogOpen(false)

    fetchOrders()
    fetchSupplierPrices()
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsSidebarOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <SupplierSidebar userRole={userRole} />

      <div className="flex-1 p-8 max-w-[1600px]">
        <div className="mb-10">
          <h1 className="text-2xl font-medium tracking-wider mb-1">DASHBOARD</h1>
          <p className="text-sm text-[#888888] font-medium">Overview of processing orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* TOTAL ORDERS */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">TOTAL ORDERS</p>
            <p className="text-3xl font-medium text-black">{totalOrders}</p>
          </div>

          {/* NEEDS ATTENTION */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">NEEDS ATTENTION</p>
            <p className="text-3xl font-medium text-black">{needsAttention}</p>
          </div>

          {/* UNPROCESSED */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">UNPROCESSED</p>
            <p className="text-3xl font-medium text-black">{unprocessed}</p>
          </div>

          {/* PROCESSED */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">PROCESSED</p>
            <p className="text-3xl font-medium text-black">{processed}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs tracking-wider uppercase text-[#555] font-medium">UNPROCESSED ORDERS</h2>
            <Button
              onClick={handleExport}
              disabled={selectedOrders.size === 0}
              className={`rounded-full px-5 py-2 text-xs font-medium ${
                selectedOrders.size === 0
                  ? "bg-[#E5E5E5] text-[#A0A0A0] cursor-not-allowed"
                  : "bg-black text-white hover:bg-black/90"
              }`}
            >
              Export Selected
            </Button>
          </div>
        </div>

        <div className="border border-[#E6E6E6] rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-[#EFEFEF]">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={selectedOrders.size === unprocessedOrders.length && unprocessedOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] tracking-wider uppercase text-[#888] font-medium">
                    ORDER ID
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] tracking-wider uppercase text-[#888] font-medium">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] tracking-wider uppercase text-[#888] font-medium">
                    DATE
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] tracking-wider uppercase text-[#888] font-medium">
                    ITEMS
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] tracking-wider uppercase text-[#888] font-medium">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#888]">
                      Loading orders...
                    </td>
                  </tr>
                ) : unprocessedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#888]">
                      No unprocessed orders found
                    </td>
                  </tr>
                ) : (
                  unprocessedOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FAFAFA] transition-colors ${
                        index !== unprocessedOrders.length - 1 ? "border-b border-[#EFEFEF]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedOrders.has(order.id)}
                          onCheckedChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => handleOrderClick(order)}>
                        <p className="text-sm font-medium text-black">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-black">{order.customer_name || "Unknown"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-black">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-medium text-black">{order.order_items?.length || 0}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-[#FFF4E6] text-[#C87F33]">
                          UNPROCESSED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="tracking-widest uppercase">Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-name" className="text-xs tracking-widest uppercase">
                Invoice Name
              </Label>
              <Input
                id="invoice-name"
                placeholder="e.g., January 2025 Orders"
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                className="rounded-none border-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase">Product Prices</Label>
              <div className="border border-black/10 rounded-none">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Variant</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Supplier Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {orders
                      .filter((o) => selectedOrders.has(o.id))
                      .flatMap((order) =>
                        order.order_items.map((item) => {
                          const key = `${item.product_id}-${item.variant_id}`
                          return (
                            <tr key={`${order.id}-${item.id}`}>
                              <td className="px-4 py-2">{item.products?.name || "N/A"}</td>
                              <td className="px-4 py-2 text-xs text-zinc-500">
                                {item.product_variants?.size || "N/A"} / {item.product_variants?.color || "N/A"}
                              </td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={supplierPrices[key] || ""}
                                  onChange={(e) => handlePriceChange(item.product_id, item.variant_id, e.target.value)}
                                  className="w-24 h-8 rounded-none border-black text-sm"
                                />
                              </td>
                            </tr>
                          )
                        }),
                      )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-500">
                Prices will be saved for future exports. All products must have a price to export.
              </p>
            </div>

            <div className="pt-4 border-t border-black/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium tracking-widest uppercase">Total Price:</span>
                <span className="text-xl font-medium">${calculateTotalPrice()}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              {selectedOrders.size} order(s) will be exported and moved to "Preparing" status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={!canExport()} className="rounded-none">
              Create & Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Sidebar */}
      {selectedOrder && (
        <OrderDetailsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          orderItems={selectedOrder.order_items}
          orderId={selectedOrder.id}
          orderTotal={selectedOrder.total}
          shippingAddress={selectedOrder.shipping_address}
          orderStatus={selectedOrder.supplier_status || "unprocessed"}
          onStatusUpdate={() => {
            // Refresh orders after status update
            fetchOrders()
          }}
        />
      )}
    </div>
  )
}
