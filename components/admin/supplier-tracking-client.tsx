"use client"

import { useEffect, useState } from "react"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Truck, AlertTriangle, Search } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type Order = {
  id: string
  created_at: string
  status: string
  supplier_status: string
  total: number
  tracking_number: string | null
  courier: string | null
  delivery_issue: boolean | null
  delivery_notes: string | null
  shipping_address: {
    firstName?: string
    lastName?: string
    address?: string
    apartment?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  } | null
  profiles: {
    email: string
    full_name: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    tracking_number: string | null
    courier: string | null
    products: {
      name: string
    } | null
    product_variants: {
      size: string
      color: string
    } | null
  }>
}

type SupplierTrackingClientProps = {
  initialOrders: Order[]
  supplierId: string
  userRole?: string
}

export function SupplierTrackingClient({ initialOrders, supplierId, userRole }: SupplierTrackingClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [issueNotes, setIssueNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const channel = supabase
      .channel("supplier-tracking-changes")
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
        profiles (
          email,
          full_name
        ),
        order_items (
          id,
          quantity,
          price,
          tracking_number,
          courier,
          products (
            name
          ),
          product_variants (
            size,
            color
          )
        )
      `,
      )
      .eq("status", "processing")
      .in("supplier_status", ["in_transit", "delivered"])
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const filterOrders = (ordersList: Order[]) => {
    if (!searchQuery.trim()) return ordersList

    const query = searchQuery.toLowerCase()
    return ordersList.filter((order) => {
      const orderId = order.id.slice(0, 8).toUpperCase()
      const customerName = order.profiles?.full_name?.toLowerCase() || ""
      const customerEmail = order.profiles?.email?.toLowerCase() || ""
      const trackingNumbers = order.order_items?.map((item) => item.tracking_number?.toLowerCase() || "").join(" ")

      return (
        orderId.includes(query.toUpperCase()) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        trackingNumbers.includes(query)
      )
    })
  }

  const inTransitOrders = filterOrders(orders.filter((o) => o.supplier_status === "in_transit" && !o.delivery_issue))
  const issueOrders = filterOrders(orders.filter((o) => o.delivery_issue === true))

  const getTrackingInfo = (order: Order) => {
    const trackingNumbers = order.order_items
      ?.map((item) => item.tracking_number)
      .filter((tn) => tn && tn.trim() !== "")
    const couriers = order.order_items?.map((item) => item.courier).filter((c) => c && c.trim() !== "")

    return {
      tracking: trackingNumbers && trackingNumbers.length > 0 ? trackingNumbers : ["N/A"],
      courier: couriers && couriers.length > 0 ? [...new Set(couriers)] : ["N/A"],
    }
  }

  const handleReportIssue = (order: Order) => {
    setSelectedOrder(order)
    setIssueNotes(order.delivery_notes || "")
    setIsIssueDialogOpen(true)
  }

  const handleSaveIssue = async () => {
    if (!selectedOrder) return

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_issue: true,
        delivery_notes: issueNotes.trim() || null,
      })
      .eq("id", selectedOrder.id)

    if (error) {
      console.error("[v0] Error reporting issue:", error)
      alert("Failed to report delivery issue")
      return
    }

    setIsIssueDialogOpen(false)
    setSelectedOrder(null)
    setIssueNotes("")
    fetchOrders()
  }

  const handleResolveIssue = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        delivery_issue: false,
        delivery_notes: null,
      })
      .eq("id", orderId)

    if (error) {
      console.error("[v0] Error resolving issue:", error)
      alert("Failed to resolve delivery issue")
      return
    }

    fetchOrders()
  }

  return (
    <div className="flex min-h-screen bg-white">
      <SupplierSidebar userEmail={userRole} userRole={userRole} />

      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-medium tracking-tight mb-1">TRACKING</h1>
          <p className="text-sm text-[#888888] font-medium">Monitor shipments and delivery status</p>
        </div>

        <div className="mb-5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] stroke-[1.5]" />
            <Input
              type="text"
              placeholder="Search by order ID, customer, or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 rounded-xl border border-[#E6E6E6] focus:border-black focus-visible:ring-0 text-sm placeholder:text-[#999999]"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white rounded-[14px] border border-[#E6E6E6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="bg-[#EDF4FF] px-6 py-5 border-b border-[#E6E6E6]">
              <div className="flex items-center gap-3 mb-1">
                <Truck className="w-5 h-5 text-[#4774D3] stroke-[1.5]" />
                <h2 className="text-base font-medium text-black">IN TRANSIT ({inTransitOrders.length})</h2>
              </div>
              <p className="text-sm text-[#777777]">Orders currently being delivered</p>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0 z-10 border-b border-[#EFEFEF]">
                  <tr className="h-[50px]">
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ORDER ID
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      CUSTOMER
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      DATE
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ITEMS
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      TRACKING
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      COURIER
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F2]">
                  {inTransitOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#999999]">
                        {searchQuery ? "No orders found matching your search" : "No orders in transit"}
                      </td>
                    </tr>
                  ) : (
                    inTransitOrders.map((order) => {
                      const { tracking, courier } = getTrackingInfo(order)
                      return (
                        <tr key={order.id} className="h-16 hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-6 text-sm font-medium uppercase">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 text-sm">
                            <p className="font-medium text-black">{order.profiles?.full_name || "Unknown"}</p>
                          </td>
                          <td className="px-6 text-sm text-[#444444]">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 text-sm text-center">
                            <span className="font-medium text-black">{order.order_items?.length || 0}</span>
                          </td>
                          <td className="px-6 text-sm">
                            {tracking.map((tn, idx) => (
                              <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                                {tn !== "N/A" ? (
                                  <a
                                    href={`https://www.17track.net/en/track?nums=${tn}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#0066CC] hover:underline font-mono text-xs"
                                  >
                                    {tn}
                                  </a>
                                ) : (
                                  <span className="text-[#999999]">{tn}</span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 text-sm text-[#444444]">
                            {courier.map((c, idx) => (
                              <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                                {c}
                              </div>
                            ))}
                          </td>
                          <td className="px-6">
                            <Button
                              onClick={() => handleReportIssue(order)}
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-[10px] border border-[#E0E0E0] bg-white hover:bg-[#F3F3F3] text-xs font-medium px-3"
                            >
                              REPORT ISSUE
                            </Button>
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

        <div>
          <div className="bg-white rounded-[14px] border border-[#E6E6E6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="bg-[#FFF1F1] px-6 py-5 border-b border-[#E6E6E6]">
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="w-5 h-5 text-[#C64545] stroke-[1.5]" />
                <h2 className="text-base font-medium text-black">DELIVERY ISSUES ({issueOrders.length})</h2>
              </div>
              <p className="text-sm text-[#777777]">Orders with delivery problems requiring investigation</p>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0 z-10 border-b border-[#EFEFEF]">
                  <tr className="h-[50px]">
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ORDER ID
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      CUSTOMER
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      DATE
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      TRACKING
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ISSUE NOTES
                    </th>
                    <th className="px-6 text-left text-[12px] font-medium tracking-wide uppercase text-[#888888]">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F2]">
                  {issueOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#999999]">
                        No delivery issues reported
                      </td>
                    </tr>
                  ) : (
                    issueOrders.map((order) => {
                      const { tracking } = getTrackingInfo(order)
                      return (
                        <tr key={order.id} className="h-16 hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-6 text-sm font-medium uppercase">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 text-sm">
                            <p className="font-medium text-black">{order.profiles?.full_name || "Unknown"}</p>
                          </td>
                          <td className="px-6 text-sm text-[#444444]">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 text-sm">
                            {tracking.map((tn, idx) => (
                              <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                                {tn !== "N/A" ? (
                                  <a
                                    href={`https://www.17track.net/en/track?nums=${tn}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#0066CC] hover:underline font-mono text-xs"
                                  >
                                    {tn}
                                  </a>
                                ) : (
                                  <span className="text-[#999999]">{tn}</span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 text-sm max-w-xs">
                            <p className="truncate text-[#444444]" title={order.delivery_notes || ""}>
                              {order.delivery_notes || "No notes"}
                            </p>
                          </td>
                          <td className="px-6">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReportIssue(order)}
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-[10px] border border-[#E0E0E0] bg-white hover:bg-[#F3F3F3] text-xs font-medium px-3"
                              >
                                VIEW
                              </Button>
                            </div>
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
      </div>

      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Report Delivery Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-notes" className="text-sm font-medium">
                Issue Description
              </Label>
              <Textarea
                id="issue-notes"
                placeholder="Describe the delivery issue (e.g., package lost, damaged, wrong address, etc.)"
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                className="rounded-lg border-[#E6E6E6] min-h-[100px] text-sm"
              />
            </div>
            <p className="text-xs text-[#777777]">
              This order will be moved to the "Delivery Issues" section for investigation.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsIssueDialogOpen(false)}
              className="rounded-lg border-[#E0E0E0] hover:bg-[#F3F3F3]"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveIssue} className="rounded-lg bg-black hover:bg-black/90">
              Report Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
