"use client"

import { useState } from "react"
import { Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import Link from "next/link"

interface Membership {
  id: string
  user_id: string
  member_id: string
  status: string
  member_since: string
  valid_until: string
  last_status_change: string | null
  tier_history: any[]
  notes: string | null
  profile: {
    id: string
    email: string
    full_name: string | null
    first_name: string | null
    last_name: string | null
  }
}

interface MembershipsClientProps {
  initialMemberships: Membership[]
}

export default function MembershipsClient({ initialMemberships }: MembershipsClientProps) {
  const [memberships, setMemberships] = useState<Membership[]>(initialMemberships)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      membership.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || membership.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "black":
        return "bg-black text-white border-black"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.floor((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const statusCounts = {
    silver: memberships.filter((m) => m.status === "silver").length,
    gold: memberships.filter((m) => m.status === "gold").length,
    platinum: memberships.filter((m) => m.status === "platinum").length,
    black: memberships.filter((m) => m.status === "black").length,
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">MEMBERSHIPS</h1>
          <p className="text-sm text-zinc-500 tracking-wide">Central overview of all member loyalty data</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-700">Silver</p>
                <p className="mt-1 text-2xl font-medium text-gray-900">{statusCounts.silver}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-yellow-700">Gold</p>
                <p className="mt-1 text-2xl font-medium text-yellow-900">{statusCounts.gold}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-purple-700">Platinum</p>
                <p className="mt-1 text-2xl font-medium text-purple-900">{statusCounts.platinum}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Black</p>
                <p className="mt-1 text-2xl font-medium text-white">{statusCounts.black}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-zinc-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by Member ID, email, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {["all", "silver", "gold", "platinum", "black"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Memberships Table */}
        <div className="border border-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Member ID</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">User</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Member Since</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Valid Until</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredMemberships.map((membership) => (
                  <tr key={membership.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-zinc-900">{membership.member_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {membership.profile.full_name || membership.profile.email}
                        </p>
                        <p className="text-xs text-zinc-500">{membership.profile.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(membership.status)}`}
                      >
                        {membership.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        {formatDate(membership.member_since)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-600">{formatDate(membership.valid_until)}</span>
                        {isExpired(membership.valid_until) && (
                          <span className="text-xs font-medium text-red-600">Expired</span>
                        )}
                        {isExpiringSoon(membership.valid_until) && !isExpired(membership.valid_until) && (
                          <span className="text-xs font-medium text-amber-600">Expiring soon</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/memberships/${membership.id}`}>
                        <Button variant="outline" size="sm" className="rounded-none bg-transparent">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMemberships.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-500">No memberships found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
