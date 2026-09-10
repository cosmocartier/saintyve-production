"use client"

import { useState } from "react"
import { DistributorSidebar } from "@/components/admin/distributor-sidebar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, AlertCircle, Clock, CheckCircle } from "lucide-react"

type DistributorDashboardClientProps = {
  userRole?: string
  userEmail?: string
}

// Static placeholder rows to mirror the supplier dashboard table layout
const placeholderOrders = [
  { id: "A1B2C3D4", customer: "—", date: "—", items: "—", status: "UNPROCESSED" },
  { id: "E5F6G7H8", customer: "—", date: "—", items: "—", status: "UNPROCESSED" },
  { id: "I9J0K1L2", customer: "—", date: "—", items: "—", status: "UNPROCESSED" },
]

export function DistributorDashboardClient({ userRole, userEmail }: DistributorDashboardClientProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === placeholderOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(placeholderOrders.map((o) => o.id)))
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DistributorSidebar userRole={userRole} userEmail={userEmail} />

      <div className="flex-1 p-8 max-w-[1600px]">
        <div className="mb-10">
          <h1 className="text-2xl font-medium tracking-wider mb-1">DASHBOARD</h1>
          <p className="text-sm text-[#888888] font-medium">Overview of distribution orders</p>
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
            <p className="text-3xl font-medium text-black">0</p>
          </div>

          {/* NEEDS ATTENTION */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">NEEDS ATTENTION</p>
            <p className="text-3xl font-medium text-black">0</p>
          </div>

          {/* UNPROCESSED */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">UNPROCESSED</p>
            <p className="text-3xl font-medium text-black">0</p>
          </div>

          {/* PROCESSED */}
          <div className="border border-[#E6E6E6] rounded-xl p-5 bg-white hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#666]" />
              </div>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-[#777] mb-1 font-medium">PROCESSED</p>
            <p className="text-3xl font-medium text-black">0</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs tracking-wider uppercase text-[#555] font-medium">UNPROCESSED ORDERS</h2>
            <Button
              disabled
              className="rounded-full px-5 py-2 text-xs font-medium bg-[#E5E5E5] text-[#A0A0A0] cursor-not-allowed"
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
                      checked={selectedOrders.size === placeholderOrders.length && placeholderOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled
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
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#888]">
                    No unprocessed orders found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
