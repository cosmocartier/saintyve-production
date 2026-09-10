"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { OrderDetailsSidebar } from "@/components/admin/order-details-sidebar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type Order = {
  id: string
  created_at: string
  status: string
  total: number
  payment_method: string | null
  processed_by_supplier: boolean
  shipping_address: any
  billing_email: string | null
  customer_name: string | null
  customer_email: string | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product_id: string
    variant_id: string | null
    tracking_number: string | null
    courier: string | null
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
      color: string
    } | null
  }>
  supplier_status?: string
  preparing_at?: string
  in_transit_at?: string
}

type ProductPrice = {
  product_id: string
  variant_id: string | null
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  supplier_price: string
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [invoiceName, setInvoiceName] = useState("")
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile) {
          setUserRole(profile.role)
        }
      }
    }

    fetchUserRole()
    fetchOrders()

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

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          variant_id,
          tracking_number,
          courier,
          products (
            id,
            name,
            slug,
            product_images (
              url,
              color_name,
              display_order
            )
          ),
          product_variants (
            size,
            color
          )
        )
      `,
      )
      .in("status", ["processing", "completed"])
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data)
      setFilteredOrders(data)
    }
    setLoading(false)
  }

  const unprocessedFilteredOrders = filteredOrders.filter((o) => (o.supplier_status || "unprocessed") === "unprocessed")

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
    if (selectedOrders.size === unprocessedFilteredOrders.length && unprocessedFilteredOrders.length > 0) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(unprocessedFilteredOrders.map((o) => o.id)))
    }
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsSidebarOpen(true)
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

    const allProducts: ProductPrice[] = []

    for (const order of selectedOrdersData) {
      for (const item of order.order_items) {
        allProducts.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.products?.name || "Unknown",
          size: item.product_variants?.size || null,
          color: item.product_variants?.color || null,
          quantity: item.quantity,
          supplier_price: "",
        })
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: savedPrices } = await supabase.from("supplier_product_prices").select("*").eq("supplier_id", user.id)

    if (savedPrices) {
      allProducts.forEach((product) => {
        const savedPrice = savedPrices.find(
          (p) => p.product_id === product.product_id && p.variant_id === product.variant_id,
        )
        if (savedPrice) {
          product.supplier_price = savedPrice.supplier_price.toString()
        }
      })
    }

    setProductPrices(allProducts)
    setIsExportDialogOpen(true)
  }

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...productPrices]
    newPrices[index].supplier_price = value
    setProductPrices(newPrices)
  }

  const canExport = productPrices.every((p) => p.supplier_price && Number.parseFloat(p.supplier_price) > 0)

  const calculateTotal = () => {
    return productPrices.reduce((sum, p) => sum + Number.parseFloat(p.supplier_price || "0") * p.quantity, 0)
  }

  const calculateProcessingTime = (order: Order): string => {
    const preparingAt = (order as any).preparing_at
    const inTransitAt = (order as any).in_transit_at

    if (!preparingAt || !inTransitAt) {
      return "—"
    }

    const start = new Date(preparingAt)
    const end = new Date(inTransitAt)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffMinutes}m`
    }
  }

  useEffect(() => {
    let filtered = [...orders]

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        const status = order.supplier_status || "unprocessed"
        return status === statusFilter
      })
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((order) => {
        const orderId = order.id.slice(0, 8).toLowerCase()
        const customerName = (order.customer_name || "").toLowerCase()
        const customerEmail = (order.customer_email || "").toLowerCase()
        const productNames = order.order_items.map((item) => (item.products?.name || "").toLowerCase()).join(" ")

        return (
          orderId.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          productNames.includes(query)
        )
      })
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchQuery])

  const handleCreateInvoice = async () => {
    if (!invoiceName.trim()) {
      alert("Please enter an invoice name")
      return
    }

    if (!canExport) {
      alert("Please enter prices for all products before exporting.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    for (const product of productPrices) {
      await supabase.from("supplier_product_prices").upsert(
        {
          supplier_id: user.id,
          product_id: product.product_id,
          variant_id: product.variant_id,
          supplier_price: Number.parseFloat(product.supplier_price),
        },
        {
          onConflict: "supplier_id,product_id,variant_id",
        },
      )
    }

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

    const { error: invoiceError } = await supabase.from("supplier_invoices").insert({
      supplier_id: user.id,
      name: invoiceName,
      total_price: calculateTotal(),
      order_ids: Array.from(selectedOrders),
      csv_data: selectedOrdersData,
    })

    if (invoiceError) {
      console.error("[v0] Error creating invoice:", invoiceError)
      alert("Failed to create invoice")
      return
    }

    await supabase
      .from("orders")
      .update({
        processed_by_supplier: true,
        supplier_status: "preparing",
      })
      .in("id", Array.from(selectedOrders))

    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${invoiceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setSelectedOrders(new Set())
    setInvoiceName("")
    setProductPrices([])
    setIsExportDialogOpen(false)
    fetchOrders()
  }

  const getStatusBadge = (order: Order) => {
    const status = order.supplier_status || "unprocessed"

    const statusConfig = {
      unprocessed: { label: "UNPROCESSED", className: "bg-orange-100 text-orange-800" },
      preparing: { label: "PREPARING", className: "bg-blue-100 text-blue-800" },
      in_transit: { label: "IN TRANSIT", className: "bg-purple-100 text-purple-800" },
      delivered: { label: "DELIVERED", className: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unprocessed

    return <span className={`inline-block px-2 py-1 text-xs tracking-wider ${config.className}`}>{config.label}</span>
  }

  return (
    <div className="flex min-h-screen bg-white">
      <SupplierSidebar userEmail={userRole} />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-wide mb-1">ORDERS</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage and export processing orders</p>
        </div>

        <div className="mb-5 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
            <Input
              placeholder="Search by order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 rounded-xl border border-zinc-200 focus:border-zinc-400 focus-visible:ring-0 font-medium text-sm placeholder:text-zinc-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors font-medium text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-zinc-200 shadow-sm">
              <SelectItem value="all" className="font-medium hover:bg-zinc-50">
                All Orders
              </SelectItem>
              <SelectItem value="unprocessed" className="font-medium hover:bg-zinc-50">
                Unprocessed
              </SelectItem>
              <SelectItem value="preparing" className="font-medium hover:bg-zinc-50">
                Preparing
              </SelectItem>
              <SelectItem value="in_transit" className="font-medium hover:bg-zinc-50">
                In Transit
              </SelectItem>
              <SelectItem value="delivered" className="font-medium hover:bg-zinc-50">
                Delivered
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <p className="text-sm text-zinc-500 font-medium">
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
          </p>
        </div>

        {selectedOrders.size > 0 && (
          <div className="mb-4 flex items-center justify-between h-13 px-6 bg-white border-b border-zinc-200">
            <p className="text-sm font-medium text-zinc-700">{selectedOrders.size} PRODUCTS SELECTED</p>
            <Button
              onClick={handleExport}
              disabled={selectedOrders.size === 0}
              className="h-10 px-6 rounded-full bg-black text-white hover:bg-zinc-900 font-medium text-sm"
            >
              EXPORT SELECTED
            </Button>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-[14px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50/50">
                <tr>
                  <th className="pl-4 pr-2 py-4 text-left w-12">
                    <Checkbox
                      checked={
                        selectedOrders.size === unprocessedFilteredOrders.length && unprocessedFilteredOrders.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    ORDER ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    ITEMS
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    PROCESSING TIME
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                      {searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders found"}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isUnprocessed = (order.supplier_status || "unprocessed") === "unprocessed"
                    const customerName = order.customer_name || "Unknown"
                    const customerEmail = order.customer_email
                    const processingTime = calculateProcessingTime(order)

                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                        <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                            disabled={!isUnprocessed}
                            className={`data-[state=checked]:bg-black data-[state=checked]:border-black ${!isUnprocessed ? "opacity-40 cursor-not-allowed" : ""}`}
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-black group-hover:underline"
                          onClick={() => handleOrderClick(order)}
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-sm" onClick={() => handleOrderClick(order)}>
                          <div>
                            <p className="font-medium text-black">{customerName}</p>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-black"
                          onClick={() => handleOrderClick(order)}
                        >
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-black text-center"
                          onClick={() => handleOrderClick(order)}
                        >
                          {order.order_items?.length || 0}
                        </td>
                        <td className="px-4 py-3" onClick={() => handleOrderClick(order)}>
                          {getStatusBadge(order)}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium text-black"
                          onClick={() => handleOrderClick(order)}
                        >
                          {processingTime}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          orderItems={selectedOrder.order_items}
          orderId={selectedOrder.id}
          orderTotal={selectedOrder.total}
          shippingAddress={selectedOrder.shipping_address}
          orderStatus={selectedOrder.supplier_status || "unprocessed"}
          onStatusUpdate={fetchOrders}
        />
      )}

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
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Size</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Supplier Price</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {productPrices.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{product.product_name}</td>
                        <td className="px-4 py-2">{product.size || "N/A"}</td>
                        <td className="px-4 py-2">{product.quantity}</td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={product.supplier_price}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            className="h-8 w-24 rounded-none border-black"
                          />
                        </td>
                        <td className="px-4 py-2">
                          ${(Number.parseFloat(product.supplier_price || "0") * product.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-50 font-medium">
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs tracking-widest uppercase">
                        Total Price:
                      </td>
                      <td className="px-4 py-2">${calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {!canExport && (
              <p className="text-xs text-red-600">Please enter prices for all products before exporting.</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              className="rounded-none border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={!canExport}
              className="rounded-none bg-black text-white hover:bg-black/90"
            >
              Create & Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
