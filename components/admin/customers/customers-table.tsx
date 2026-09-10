"use client"

import { useState } from "react"
import { Edit2, ShieldCheck, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"

export type Customer = {
  id: string
  email: string
  full_name: string | null
  status: string | null
  access_granted: boolean | null
  created_at: string
  orders: Array<{
    id: string
    total: number
  }>
}

const MEMBERSHIP_TIERS = ["bronze", "silver", "gold", "platinum", "black"] as const

interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  onCustomerUpdated: (id: string, updates: Partial<Customer>) => void
}

const formatTier = (status: string | null) => {
  if (!status) return "Bronze"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getTierColor = (status: string | null) => {
  const colors: Record<string, string> = {
    bronze: "bg-[#CD7F32] text-white",
    silver: "bg-[#C0C0C0] text-black",
    gold: "bg-[#FFD700] text-black",
    platinum: "bg-[#E5E4E2] text-black",
    black: "bg-black text-white",
  }
  return colors[status?.toLowerCase() || "bronze"] || colors.bronze
}

export function CustomersTable({ customers, loading, onCustomerUpdated }: CustomersTableProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [grantingAccess, setGrantingAccess] = useState<Record<string, boolean>>({})
  const supabase = createBrowserClient()

  const handleGrantAccess = async (customer: Customer) => {
    setGrantingAccess((prev) => ({ ...prev, [customer.id]: true }))
    try {
      const res = await fetch("/api/registration/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: customer.id }),
      })
      if (res.ok) {
        onCustomerUpdated(customer.id, { access_granted: true })
      } else {
        console.error("[v0] Failed to grant access")
      }
    } catch (err) {
      console.error("[v0] Grant access error:", err)
    } finally {
      setGrantingAccess((prev) => ({ ...prev, [customer.id]: false }))
    }
  }

  const handleEditStatus = (customer: Customer) => {
    setEditingCustomer(customer)
    setSelectedStatus(customer.status || "bronze")
  }

  const handleUpdateStatus = async () => {
    if (!editingCustomer) return
    const previousStatus = editingCustomer.status
    const newStatus = selectedStatus

    setIsUpdating(true)
    const { error } = await supabase.from("profiles").update({ status: selectedStatus }).eq("id", editingCustomer.id)

    if (error) {
      console.error("[v0] Error updating status:", error)
      alert("Failed to update membership status")
    } else {
      onCustomerUpdated(editingCustomer.id, { status: selectedStatus })

      if (newStatus === "platinum" && previousStatus !== "platinum") {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", editingCustomer.id)
            .single()

          const response = await fetch("/api/membership/activate-platinum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: editingCustomer.email,
              customerName: profileData?.first_name || editingCustomer.email,
            }),
          })

          if (!response.ok) {
            console.error("[v0] Failed to send Platinum activation email")
          }
        } catch (emailError) {
          console.error("[v0] Error sending Platinum activation email:", emailError)
        }
      }

      setEditingCustomer(null)
    }
    setIsUpdating(false)
  }

  return (
    <>
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Customer</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Email</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Membership</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Access</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Joined</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Orders</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Spent</th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const totalSpent = customer.orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
                  const isPendingApproval = customer.access_granted === false
                  const isGranting = grantingAccess[customer.id] || false
                  return (
                    <tr key={customer.id} className={`transition-colors hover:bg-white/[0.02] ${isPendingApproval ? "bg-amber-500/[0.04]" : ""}`}>
                      <td className="px-5 py-4 font-sans text-[11px] text-white/80 font-medium">{customer.full_name || "Unknown"}</td>
                      <td className="px-5 py-4 font-sans text-[11px] text-white/45">{customer.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[9px] font-medium tracking-widest uppercase ${getTierColor(customer.status)}`}>
                          {formatTier(customer.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isPendingApproval ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1 h-1 rounded-full bg-amber-400" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            Granted
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-sans text-[11px] text-white/30">{new Date(customer.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-sans text-[11px] text-white/45">{customer.orders?.length || 0}</td>
                      <td className="px-5 py-4 font-sans text-[11px] text-white/60 font-medium">${totalSpent.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isPendingApproval && (
                            <button
                              onClick={() => handleGrantAccess(customer)}
                              disabled={isGranting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[9px] font-medium tracking-[0.16em] uppercase border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-30 disabled:cursor-wait"
                            >
                              {isGranting ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Granting</>
                              ) : (
                                <><ShieldCheck className="w-3 h-3" /> Grant Access</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleEditStatus(customer)}
                            className="h-7 w-7 flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
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

      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-md bg-[#131313] border border-white/8 rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-[13px] font-light uppercase tracking-[0.15em] text-white/80">Edit Membership</DialogTitle>
            <DialogDescription className="font-sans text-[10px] tracking-wide text-white/30">
              Update the membership tier for {editingCustomer?.full_name || editingCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/30">Membership Tier</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full rounded-xl bg-white/[0.03] border-white/8 text-white/70 font-sans text-[11px]">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent className="bg-[#131313] border-white/8 rounded-xl">
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier} className="font-sans text-[11px] text-white/60 focus:bg-white/5 focus:text-white/90">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Edition
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCustomer(null)}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl border border-white/8 bg-transparent font-sans text-[9px] uppercase tracking-[0.16em] text-white/30 hover:text-white/60 hover:border-white/15 transition-all disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 font-sans text-[9px] uppercase tracking-[0.16em] text-white/70 hover:bg-white/10 hover:text-white/90 transition-all disabled:opacity-30"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
