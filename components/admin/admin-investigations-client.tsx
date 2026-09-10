"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Search, MessageSquare, CheckCircle2, Clock, XCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { InvestigationChatDialog } from "@/components/admin/investigation-chat-dialog"

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

type Order = {
  id: string
  created_at: string
  total: number
  status: string
  customer_email: string
  customer_name: string
  profiles: {
    email: string
    full_name: string | null
  } | null
}

type AdminInvestigationsClientProps = {
  initialCases: InvestigationCase[]
  currentUserId: string
  userRole: string
}

export function AdminInvestigationsClient({ initialCases, currentUserId, userRole }: AdminInvestigationsClientProps) {
  const [cases, setCases] = useState<InvestigationCase[]>(initialCases)
  const [filteredCases, setFilteredCases] = useState<InvestigationCase[]>(initialCases)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false)
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null)
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  })
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [searchedOrders, setSearchedOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isSearchingOrders, setIsSearchingOrders] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel("investigation-cases-changes")
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
  }, [cases, searchQuery, statusFilter, priorityFilter])

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

    if (priorityFilter !== "all") {
      filtered = filtered.filter((c) => c.priority === priorityFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.order_id.toLowerCase().includes(query) ||
          c.orders?.profiles?.email?.toLowerCase().includes(query) ||
          c.orders?.profiles?.full_name?.toLowerCase().includes(query),
      )
    }

    setFilteredCases(filtered)
  }

  const searchOrders = async (query: string) => {
    if (!query.trim()) {
      setSearchedOrders([])
      return
    }

    console.log("[v0] Searching orders with query:", query)
    setIsSearchingOrders(true)

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        total,
        status,
        customer_email,
        customer_name,
        profiles (
          email,
          full_name
        )
      `,
      )
      .or(`customer_email.ilike.%${query}%,customer_name.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10)

    console.log("[v0] Search results:", { data, error })

    if (data && !error) {
      setSearchedOrders(data)
    } else if (error) {
      console.error("[v0] Error searching orders:", error.message)
    }
    setIsSearchingOrders(false)
  }

  const handleCreateCase = async () => {
    if (!selectedOrder || !newCase.title) {
      alert("Please select an order and provide a case title")
      return
    }

    console.log("[v0] Creating case for order:", selectedOrder.id)

    const { error } = await supabase.from("investigation_cases").insert({
      order_id: selectedOrder.id,
      title: newCase.title,
      description: newCase.description || null,
      priority: newCase.priority,
      created_by: currentUserId,
      status: "open",
    })

    if (error) {
      console.error("[v0] Error creating case:", error)
      alert(`Failed to create investigation case: ${error.message}`)
      return
    }

    setIsNewCaseDialogOpen(false)
    setNewCase({ title: "", description: "", priority: "medium" })
    setSelectedOrder(null)
    setOrderSearchQuery("")
    setSearchedOrders([])
    fetchCases()
  }

  const handleOpenChat = (caseItem: InvestigationCase) => {
    setSelectedCase(caseItem)
    setIsChatDialogOpen(true)
  }

  const handleResolveCase = async (caseId: string) => {
    const { error } = await supabase
      .from("investigation_cases")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: currentUserId,
      })
      .eq("id", caseId)

    if (error) {
      console.error("[v0] Error resolving case:", error)
      alert("Failed to resolve case")
      return
    }

    fetchCases()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-zinc-100 text-zinc-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "closed":
        return <XCircle className="w-4 h-4 text-zinc-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-zinc-100 text-zinc-800"
      default:
        return "bg-zinc-100 text-zinc-800"
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">INVESTIGATIONS</h1>
              <p className="text-sm text-zinc-500 tracking-wide">Manage urgent order issues and communication</p>
            </div>
            <Button
              onClick={() => setIsNewCaseDialogOpen(true)}
              className="rounded-none text-xs tracking-widest uppercase"
            >
              <Plus className="w-4 h-4 mr-2" />
              NEW CASE
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by case ID, order ID, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-black rounded-none"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-none border-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px] rounded-none border-black">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cases List */}
        <div className="border border-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">CASE ID</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">TITLE</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">ORDER</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">CUSTOMER</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">PRIORITY</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">CREATED</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-zinc-500">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                        ? "No cases found matching your filters"
                        : "No investigation cases yet"}
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm font-mono">#{caseItem.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium">{caseItem.title}</p>
                          {caseItem.description && (
                            <p className="text-xs text-zinc-500 truncate max-w-xs">{caseItem.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">#{caseItem.order_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm">
                        {caseItem.orders?.profiles?.full_name || caseItem.orders?.profiles?.email || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs tracking-widest uppercase rounded-sm ${getPriorityColor(caseItem.priority)}`}
                        >
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(caseItem.status)}
                          <span
                            className={`inline-block px-3 py-1 text-xs tracking-widest uppercase rounded-sm ${getStatusColor(caseItem.status)}`}
                          >
                            {caseItem.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(caseItem.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOpenChat(caseItem)}
                            size="sm"
                            variant="outline"
                            className="rounded-none text-xs tracking-widest uppercase"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            CHAT
                          </Button>
                          {caseItem.status !== "resolved" && caseItem.status !== "closed" && (
                            <Button
                              onClick={() => handleResolveCase(caseItem.id)}
                              size="sm"
                              className="rounded-none text-xs tracking-widest uppercase bg-black hover:bg-zinc-700"
                            >
                              RESOLVE
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Case Dialog */}
      <Dialog open={isNewCaseDialogOpen} onOpenChange={setIsNewCaseDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="tracking-widest uppercase">Create New Investigation Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order-search" className="text-xs tracking-widest uppercase">
                Search Order *
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="order-search"
                  placeholder="Search by order ID, email, or name..."
                  value={orderSearchQuery}
                  onChange={(e) => {
                    setOrderSearchQuery(e.target.value)
                    searchOrders(e.target.value)
                  }}
                  className="pl-10 rounded-none border-black"
                />
              </div>
              {selectedOrder ? (
                <div className="p-3 border border-green-500 bg-green-50 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Order #{selectedOrder.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-600">
                        {selectedOrder.profiles?.full_name || selectedOrder.profiles?.email || "Unknown"} - $
                        {selectedOrder.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(null)
                        setOrderSearchQuery("")
                      }}
                      className="text-xs"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : searchedOrders.length > 0 ? (
                <div className="border border-black/10 rounded-sm max-h-48 overflow-y-auto">
                  {searchedOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order)
                        setSearchedOrders([])
                      }}
                      className="w-full p-3 text-left hover:bg-zinc-50 border-b border-black/5 last:border-0"
                    >
                      <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-600">
                        {order.profiles?.full_name || order.profiles?.email || "Unknown"} - ${order.total.toFixed(2)} -{" "}
                        {order.status}
                      </p>
                      <p className="text-xs text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              ) : isSearchingOrders ? (
                <p className="text-xs text-zinc-500 py-2">Searching orders...</p>
              ) : orderSearchQuery && !selectedOrder ? (
                <p className="text-xs text-zinc-500 py-2">No orders found</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs tracking-widest uppercase">
                Case Title *
              </Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                className="rounded-none border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs tracking-widest uppercase">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue..."
                value={newCase.description}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                className="rounded-none border-black min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs tracking-widest uppercase">
                Priority
              </Label>
              <Select
                value={newCase.priority}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                  setNewCase({ ...newCase, priority: value })
                }
              >
                <SelectTrigger className="rounded-none border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCaseDialogOpen(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleCreateCase} className="rounded-none">
              Create Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {selectedCase && (
        <InvestigationChatDialog
          isOpen={isChatDialogOpen}
          onClose={() => {
            setIsChatDialogOpen(false)
            setSelectedCase(null)
          }}
          caseData={selectedCase}
          currentUserId={currentUserId}
          userRole={userRole}
        />
      )}
    </div>
  )
}
