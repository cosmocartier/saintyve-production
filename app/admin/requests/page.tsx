"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { RequestDetailsSidebar } from "@/components/admin/request-details-sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type ProductRequest = {
  id: string
  created_at: string
  user_id: string | null
  customer_name: string
  customer_email: string
  product_name: string
  brand: string | null
  reference_link: string | null
  details: string
  image_urls: string[]
  status: string
  admin_notes: string | null
  profiles: {
    email: string
    full_name: string | null
  } | null
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchRequests()

    const channel = supabase
      .channel("product-requests-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, () => {
        fetchRequests()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    // Removed profiles join since product_requests has customer_name and customer_email directly
    const { data, error } = await supabase
      .from("product_requests")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("[v0] Product requests result:", { error, data, count: data?.length })

    if (error) {
      console.error("[v0] Error fetching product requests:", error)
    }

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const handleViewRequest = (requestId: string) => {
    console.log("[v0] Opening request sidebar for ID:", requestId)
    setSelectedRequestId(requestId)
    setIsSidebarOpen(true)
    console.log("[v0] Sidebar state set - isOpen:", true, "requestId:", requestId)
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "quoted":
        return "bg-purple-100 text-purple-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-zinc-100 text-zinc-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reviewing":
        return "REVIEWING"
      case "quoted":
        return "QUOTED"
      case "rejected":
        return "REJECTED"
      case "completed":
        return "COMPLETED"
      case "pending":
        return "PENDING"
      default:
        return status.toUpperCase()
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">PRODUCT REQUESTS</h1>
          <p className="text-sm text-zinc-500 tracking-wide">Manage customer product requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
            <Input
              type="text"
              placeholder="Search by request ID, customer name, product, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-[#E5E5E5] rounded-md text-sm placeholder:text-[#A0A0A0]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 h-10 rounded-md text-xs tracking-wide uppercase transition-colors ${
                statusFilter === "all" ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 h-10 rounded-md text-xs tracking-wide uppercase transition-colors ${
                statusFilter === "pending" ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              PENDING
            </button>
            <button
              onClick={() => setStatusFilter("reviewing")}
              className={`px-4 h-10 rounded-md text-xs tracking-wide uppercase transition-colors ${
                statusFilter === "reviewing" ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              REVIEWING
            </button>
            <button
              onClick={() => setStatusFilter("quoted")}
              className={`px-4 h-10 rounded-md text-xs tracking-wide uppercase transition-colors ${
                statusFilter === "quoted" ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              QUOTED
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 h-10 rounded-md text-xs tracking-wide uppercase transition-colors ${
                statusFilter === "completed" ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              COMPLETED
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="border border-[#E5E5E5] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-wider uppercase text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                          <Search className="w-5 h-5 text-zinc-400 stroke-[1.5]" />
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">No requests found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-zinc-600">#{request.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{request.customer_name}</p>
                          <p className="text-xs text-zinc-500">{request.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900">{request.product_name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{request.brand || "—"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-sm ${getStatusColor(request.status)}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="px-3 py-1.5 text-xs font-medium tracking-wide uppercase border border-[#CCCCCC] rounded-md hover:bg-zinc-50 transition-colors"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Details Sidebar */}
      <RequestDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        requestId={selectedRequestId || ""}
        onUpdate={fetchRequests}
      />
    </div>
  )
}
