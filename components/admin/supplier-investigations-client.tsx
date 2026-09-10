"use client"

import { useEffect, useState } from "react"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { InvestigationChatDialog } from "@/components/admin/investigation-chat-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

type InvestigationCase = {
  id: string
  order_id: string
  created_by: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  assigned_to: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  orders: {
    id: string
    created_at: string
    total: number
    status: string
    supplier_status: string | null
    profiles: {
      email: string
      full_name: string | null
    } | null
    customer_name: string | null
    customer_email: string | null
    order_items: Array<{
      id: string
      quantity: number
      price: number
      product_id: string
      variant_id: string
      products: {
        id: string
        name: string
        slug: string
      } | null
      product_variants: {
        size: string | null
        color: string | null
      } | null
    }> | null
  } | null
  created_by_profile: {
    email: string
    full_name: string | null
    role: string
  } | null
  assigned_to_profile: {
    email: string
    full_name: string | null
  } | null
}

type SupplierInvestigationsClientProps = {
  initialCases: InvestigationCase[]
}

export function SupplierInvestigationsClient({ initialCases }: SupplierInvestigationsClientProps) {
  const [cases, setCases] = useState<InvestigationCase[]>(initialCases)
  const [filteredCases, setFilteredCases] = useState<InvestigationCase[]>(initialCases)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false)
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null)

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [preparingOrders, setPreparingOrders] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [unavailableItems, setUnavailableItems] = useState<Set<string>>(new Set())
  const [isCreatingCase, setIsCreatingCase] = useState(false)

  const [caseType, setCaseType] = useState<"item_unavailable" | "missing_package">("item_unavailable")

  const [newCase, setNewCase] = useState({
    orderId: "",
    title: "",
    description: "",
    priority: "high" as "low" | "medium" | "high" | "urgent",
  })

  const supabase = createBrowserClient()

  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel("supplier-investigation-cases-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "investigation_cases" }, () => {
        fetchCases()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchQuery, statusFilter])

  useEffect(() => {
    if (isNewCaseDialogOpen && currentStep === 1) {
      fetchPreparingOrders()
    }
  }, [isNewCaseDialogOpen, currentStep])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderSearchQuery && orderSearchQuery.length >= 2) {
        searchOrders(orderSearchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [orderSearchQuery])

  const fetchCases = async () => {
    const { data } = await supabase
      .from("investigation_cases")
      .select(
        `
        *,
        orders (
          id,
          created_at,
          total,
          status,
          supplier_status,
          profiles (
            email,
            full_name
          ),
          customer_name,
          customer_email,
          order_items (
            id,
            quantity,
            price,
            product_id,
            variant_id,
            products (
              id,
              name,
              slug
            ),
            product_variants (
              size,
              color
            )
          )
        ),
        created_by_profile:profiles!investigation_cases_created_by_fkey (
          email,
          full_name,
          role
        ),
        assigned_to_profile:profiles!investigation_cases_assigned_to_fkey (
          email,
          full_name
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (data) {
      setCases(data)
    }
  }

  const filterCases = () => {
    let filtered = cases

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.order_id.toLowerCase().includes(query) ||
          c.orders?.customer_email?.toLowerCase().includes(query) ||
          c.orders?.customer_name?.toLowerCase().includes(query),
      )
    }

    setFilteredCases(filtered)
  }

  const searchOrders = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    console.log("[v0] Searching orders with query:", query)

    // Build the query with proper UUID handling
    let orderQuery = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          variant_id,
          products (
            id,
            name,
            slug
          ),
          product_variants (
            size,
            color
          )
        ),
        profiles (
          full_name,
          email
        )
      `)
      .in("supplier_status", ["unprocessed", "preparing", "in transit"])
      .order("created_at", { ascending: false })
      .limit(20)

    // Add search conditions - cast UUID to text for searching
    const searchPattern = `%${query}%`
    orderQuery = orderQuery.or(
      `id::text.ilike.${searchPattern},customer_name.ilike.${searchPattern},customer_email.ilike.${searchPattern}`,
    )

    const { data, error } = await orderQuery

    setIsSearching(false)
    if (!error && data) {
      console.log("[v0] Search results found:", data.length)
      setSearchResults(data)
    } else if (error) {
      console.error("[v0] Search error:", error.message)
      setSearchResults([])
    }
  }

  const fetchPreparingOrders = async () => {
    console.log("[v0] Fetching preparing orders...")
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          variant_id,
          products (
            id,
            name,
            slug
          ),
          product_variants (
            size,
            color
          )
        ),
        profiles (
          full_name,
          email
        )
      `)
      .in("supplier_status", ["preparing"])
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error && data) {
      console.log("[v0] Preparing orders fetched:", data.length)
      setPreparingOrders(data)
    } else if (error) {
      console.error("[v0] Error fetching preparing orders:", error)
    }
  }

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setNewCase({
      ...newCase,
      orderId: order.id,
    })
    setSearchResults([])
    setOrderSearchQuery("")
  }

  const handleNextStep = () => {
    if (currentStep === 1 && selectedOrder) {
      setCurrentStep(2)
      const itemIds = new Set<string>()
      selectedOrder.order_items?.forEach((item: any) => {
        itemIds.add(item.id)
      })
      setUnavailableItems(itemIds)
    }
  }

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const toggleUnavailableItem = (itemId: string) => {
    const newSet = new Set(unavailableItems)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setUnavailableItems(newSet)
  }

  const getUnavailableItemsText = (description: string | null): string => {
    if (!description) return ""

    try {
      // Try to parse JSON from description
      const jsonMatch = description.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const items = JSON.parse(jsonMatch[0])
        if (Array.isArray(items) && items.length > 0) {
          const itemNames = items.map((item: any) => item.product_name).filter(Boolean)
          if (itemNames.length === 0) return ""
          if (itemNames.length === 1) return `Unavailable items: ${itemNames[0]}`
          if (itemNames.length === 2) return `Unavailable items: ${itemNames.join(", ")}`
          return `Unavailable items: ${itemNames[0]}, ${itemNames[1]}, …`
        }
      }
    } catch (e) {
      // If parsing fails, return empty
    }

    return ""
  }

  const handleCreateCase = async () => {
    if (!selectedOrder || unavailableItems.size === 0) {
      return
    }

    setIsCreatingCase(true)

    const unavailableItemsData = selectedOrder.order_items
      ?.filter((item: any) => unavailableItems.has(item.id))
      .map((item: any) => ({
        id: item.id,
        product_name: item.products?.name,
        variant: {
          size: item.product_variants?.size,
          color: item.product_variants?.color,
        },
        quantity: item.quantity,
      }))

    const firstItemName = unavailableItemsData[0]?.product_name || "Unknown Item"
    const autoGeneratedTitle =
      caseType === "item_unavailable" ? `Item Unavailable – ${firstItemName}` : `Missing Package – ${firstItemName}`

    const descriptionWithItems = `${newCase.description}\n\n---\nUnavailable Items:\n${JSON.stringify(unavailableItemsData, null, 2)}`

    const { data: newCaseData, error } = await supabase
      .from("investigation_cases")
      .insert({
        order_id: selectedOrder.id,
        title: autoGeneratedTitle,
        description: descriptionWithItems,
        priority: newCase.priority,
        status: "open",
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()

    if (!error && newCaseData) {
      try {
        await fetch("/api/investigations/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: newCaseData.id }),
        })
        toast.success("Case created and customer notified")
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        toast.success("Case created (email notification failed)")
      }

      setIsNewCaseDialogOpen(false)
      resetNewCaseDialog()
      fetchCases()
    } else {
      toast.error("Failed to create case. Please try again.")
    }

    setIsCreatingCase(false)
  }

  const resetNewCaseDialog = () => {
    setCurrentStep(1)
    setSelectedOrder(null)
    setOrderSearchQuery("")
    setSearchResults([])
    setPreparingOrders([])
    setUnavailableItems(new Set())
    setCaseType("item_unavailable")
    setNewCase({
      orderId: "",
      title: "",
      description: "",
      priority: "high",
    })
  }

  const handleOpenChat = (caseItem: InvestigationCase) => {
    router.push(`/admin/supplier/investigations/${caseItem.id}`)
  }

  const handleUpdateStatus = async (caseId: string, newStatus: "open" | "in_progress" | "resolved" | "closed") => {
    const updateData: any = { status: newStatus }

    if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString()
      updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id
    }

    const { error } = await supabase.from("investigation_cases").update(updateData).eq("id", caseId)

    if (error) {
      console.error("[v0] Error updating case status:", error)
      alert("Failed to update case status")
      return
    }

    fetchCases()
  }

  const isCreateCaseEnabled = currentStep === 1 ? selectedOrder : selectedOrder && unavailableItems.size > 0

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = (await supabase.auth.getUser()).data.user
      setCurrentUserId(user?.id || null)
    }
    fetchUser()
  }, [])

  return (
    <div className="flex min-h-screen bg-white">
      <SupplierSidebar userEmail="" userRole="" />

      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-wide mb-1">INVESTIGATIONS</h1>
            <p className="text-sm text-zinc-500 font-medium">Manage urgent order issues and communication</p>
          </div>
          <Button
            onClick={() => setIsNewCaseDialogOpen(true)}
            className="h-10 px-6 rounded-full bg-black text-white hover:bg-zinc-900 font-medium text-sm shadow-sm"
          >
            New Case
          </Button>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
            <Input
              type="text"
              placeholder="Search by case ID, order ID, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 border-zinc-200 rounded-xl text-sm font-medium placeholder:text-zinc-400 placeholder:font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10 border-zinc-200 rounded-[10px] text-sm font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[14px] shadow-[0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50/50">
                <tr className="border-b border-zinc-200">
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    CASE ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    TITLE
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    ORDER
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500 w-40">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    CREATED
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wide font-medium text-zinc-500">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-zinc-400">
                      {searchQuery || statusFilter !== "all"
                        ? "No cases found matching your filters"
                        : "No investigation cases yet"}
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((caseItem) => {
                    const unavailableItemsText = getUnavailableItemsText(caseItem.description)

                    return (
                      <tr key={caseItem.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-5 text-sm font-medium uppercase text-zinc-900">
                          #{caseItem.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div>
                            <p className="font-normal text-zinc-900">{caseItem.title}</p>
                            {unavailableItemsText && (
                              <p className="text-xs text-zinc-500 truncate max-w-xs mt-0.5">{unavailableItemsText}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-zinc-900">
                          #{caseItem.order_id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div>
                            <p className="font-medium text-zinc-900">
                              {caseItem.orders?.customer_name || "Guest Customer"}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">{caseItem.orders?.customer_email || ""}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              caseItem.status === "open"
                                ? "bg-red-50 text-red-700"
                                : caseItem.status === "in_progress"
                                  ? "bg-blue-50 text-blue-700"
                                  : caseItem.status === "resolved"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {caseItem.status === "in_progress"
                              ? "In Progress"
                              : caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-zinc-600">
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          <Button
                            onClick={() => handleOpenChat(caseItem)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs font-medium border-zinc-200 rounded-[10px] hover:bg-zinc-50"
                          >
                            VIEW CASE
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

      <Dialog open={isNewCaseDialogOpen} onOpenChange={setIsNewCaseDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-zinc-900">Create New Investigation Case</DialogTitle>
            <p className="text-xs text-zinc-500 mt-2 font-normal">
              {currentStep === 1
                ? "Search and select an order to investigate unavailable items"
                : "Mark items as unavailable and provide case details"}
            </p>
          </DialogHeader>

          {currentStep === 1 && (
            <div className="space-y-4 py-4">
              {/* Order Search */}
              <div className="space-y-2">
                <Label htmlFor="order-search" className="text-sm font-medium text-zinc-700">
                  Search for Order
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="order-search"
                    placeholder="Search by order ID, customer name, or email..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-zinc-200 text-sm"
                  />
                </div>

                {(isSearching ||
                  searchResults.length > 0 ||
                  (orderSearchQuery.length === 0 && preparingOrders.length > 0)) && (
                  <div className="bg-white border border-[#E6E6E6] rounded-xl mt-3 max-h-[400px] overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-3 text-sm text-zinc-500 text-center">Searching orders...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2.5 bg-zinc-50/50 border-b border-[#E6E6E6] sticky top-0">
                          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                            Search Results ({searchResults.length})
                          </p>
                        </div>
                        {searchResults.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            className="w-full px-4 py-3 text-left hover:bg-zinc-50 border-b border-[#E6E6E6] last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-[#777] mt-1">
                                  {order.customer_name || order.profiles?.full_name || order.customer_email}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] px-2 py-1 rounded-md bg-orange-50 text-orange-600 font-medium">
                                  {order.supplier_status || "N/A"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : preparingOrders.length > 0 ? (
                      <>
                        <div className="px-4 py-2.5 bg-orange-50/30 border-b border-[#E6E6E6] sticky top-0">
                          <p className="text-[11px] font-medium text-orange-700 uppercase tracking-wider">
                            Orders Being Prepared ({preparingOrders.length})
                          </p>
                        </div>
                        {preparingOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            className="w-full px-4 py-3 text-left hover:bg-zinc-50 border-b border-[#E6E6E6] last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-[#777] mt-1">
                                  {order.customer_name || order.profiles?.full_name || order.customer_email}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] px-2 py-1 rounded-md bg-orange-50 text-orange-600 font-medium">
                                  Preparing
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-zinc-500 text-center">No orders found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedOrder && (
                <div className="p-4 bg-zinc-50 rounded-xl border border-[#E6E6E6] mt-4">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-500 mb-3">Selected Order</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Order ID</span>
                      <span className="font-medium text-zinc-900">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Customer</span>
                      <span className="font-medium text-zinc-900">
                        {selectedOrder.customer_name ||
                          selectedOrder.profiles?.full_name ||
                          selectedOrder.customer_email}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Status</span>
                      <span className="font-medium text-zinc-900">{selectedOrder.supplier_status || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Items</span>
                      <span className="font-medium text-zinc-900">{selectedOrder.order_items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Total</span>
                      <span className="font-medium text-zinc-900">€{selectedOrder.total?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Unavailable Items & Case Info */}
          {currentStep === 2 && selectedOrder && (
            <div className="py-4 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-zinc-700">Mark Unavailable Items *</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={unavailableItems.has(item.id)}
                          onCheckedChange={() => toggleUnavailableItem(item.id)}
                          className="mt-0.5 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">
                            {item.products?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-[#777] mt-1">
                            {item.product_variants?.size && `Size: ${item.product_variants.size}`}
                            {item.product_variants?.size && item.product_variants?.color && " • "}
                            {item.product_variants?.color && `Color: ${item.product_variants.color}`}
                            {" • "}
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {unavailableItems.size > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    {unavailableItems.size} item{unavailableItems.size !== 1 ? "s" : ""} marked as unavailable
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="case-type" className="text-sm font-medium text-zinc-700">
                  Case Type *
                </Label>
                <Select
                  value={caseType}
                  onValueChange={(value: "item_unavailable" | "missing_package") => setCaseType(value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-[#E6E6E6] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item_unavailable">Item Unavailable</SelectItem>
                    <SelectItem value="missing_package">Missing Package</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">
                  The case title will be automatically generated with the first unavailable item name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-zinc-700">
                  Description / Notes
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about the unavailable items..."
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="min-h-[120px] rounded-xl border-[#E6E6E6] text-sm resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-row justify-between">
            <Button variant="outline" onClick={() => setIsNewCaseDialogOpen(false)} disabled={isCreatingCase}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {currentStep === 2 && (
                <Button variant="outline" onClick={handleBackStep} disabled={isCreatingCase}>
                  Back
                </Button>
              )}
              {currentStep === 1 ? (
                <Button onClick={handleNextStep} disabled={!selectedOrder}>
                  Next: Mark Items
                </Button>
              ) : (
                <Button
                  onClick={handleCreateCase}
                  disabled={unavailableItems.size === 0 || isCreatingCase}
                  className="min-w-[120px]"
                >
                  {isCreatingCase ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Case"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCase && (
        <InvestigationChatDialog
          isOpen={isChatDialogOpen}
          onClose={() => {
            setIsChatDialogOpen(false)
            setSelectedCase(null)
          }}
          caseData={selectedCase}
          currentUserId={currentUserId}
          userRole=""
        />
      )}
    </div>
  )
}
