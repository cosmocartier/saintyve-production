"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Check, Loader2, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CreditRequest = {
  id: string
  userId: string
  userEmail: string
  userName: string
  source: "tiktok" | "trustpilot" | "referral" | "order"
  amount: number
  status: string
  createdAt: string
  details: string
  proofUrl?: string
}

type StatusFilter = "pending" | "approved" | "declined"

export default function AdminCreditsPage() {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const fetchCreditRequests = async () => {
    setLoading(true)
    const requests: CreditRequest[] = []

    const dbStatus = statusFilter === "declined" ? "rejected" : statusFilter

    const { data: tiktokData } = await supabase
      .from("tiktok_submissions")
      .select(
        `
        id,
        user_id,
        video_url,
        proof_url,
        views_count,
        credits_awarded,
        status,
        created_at,
        profiles:user_id (
          email,
          full_name
        )
      `,
      )
      .eq("status", dbStatus)

    if (tiktokData) {
      tiktokData.forEach((item: any) => {
        requests.push({
          id: item.id,
          userId: item.user_id,
          userEmail: item.profiles?.email || "Unknown",
          userName: item.profiles?.full_name || "Unknown",
          source: "tiktok",
          amount: item.credits_awarded || 100,
          status: item.status,
          createdAt: item.created_at,
          details: `TikTok video with ${item.views_count?.toLocaleString() || "N/A"} views`,
          proofUrl: item.proof_url || item.video_url,
        })
      })
    }

    const { data: trustpilotData, error: trustpilotError } = await supabase
      .from("trustpilot_submissions")
      .select(
        `
        id,
        user_id,
        email,
        review_url,
        credits_amount,
        status,
        created_at
      `,
      )
      .eq("status", dbStatus)

    if (trustpilotError) {
      console.error("[v0] Trustpilot fetch error:", trustpilotError)
    }

    if (trustpilotData) {
      trustpilotData.forEach((item: any) => {
        requests.push({
          id: item.id,
          userId: item.user_id,
          userEmail: item.email || "Unknown",
          userName: item.email?.split("@")[0] || "Unknown", // Use email prefix as name
          source: "trustpilot",
          amount: item.credits_amount || 25,
          status: item.status,
          createdAt: item.created_at,
          details: `Trustpilot 5-star review (${item.email || "No email"})`,
          proofUrl: item.review_url,
        })
      })
    }

    if (statusFilter === "pending") {
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(
          `
          id,
          referrer_id,
          referred_email,
          status,
          created_at,
          profiles:referrer_id (
            email,
            full_name
          )
        `,
        )
        .eq("status", "completed")
        .eq("credits_awarded", 0)

      if (referralsData) {
        referralsData.forEach((item: any) => {
          requests.push({
            id: item.id,
            userId: item.referrer_id,
            userEmail: item.profiles?.email || "Unknown",
            userName: item.profiles?.full_name || "Unknown",
            source: "referral",
            amount: 50,
            status: "pending",
            createdAt: item.created_at,
            details: `Referred ${item.referred_email}`,
          })
        })
      }
    } else if (statusFilter === "approved") {
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(
          `
          id,
          referrer_id,
          referred_email,
          status,
          credits_awarded,
          created_at,
          profiles:referrer_id (
            email,
            full_name
          )
        `,
        )
        .eq("status", "completed")
        .gt("credits_awarded", 0)

      if (referralsData) {
        referralsData.forEach((item: any) => {
          requests.push({
            id: item.id,
            userId: item.referrer_id,
            userEmail: item.profiles?.email || "Unknown",
            userName: item.profiles?.full_name || "Unknown",
            source: "referral",
            amount: item.credits_awarded,
            status: "approved",
            createdAt: item.created_at,
            details: `Referred ${item.referred_email}`,
          })
        })
      }
    } else if (statusFilter === "declined") {
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(
          `
          id,
          referrer_id,
          referred_email,
          status,
          created_at,
          profiles:referrer_id (
            email,
            full_name
          )
        `,
        )
        .eq("status", "rejected")

      if (referralsData) {
        referralsData.forEach((item: any) => {
          requests.push({
            id: item.id,
            userId: item.referrer_id,
            userEmail: item.profiles?.email || "Unknown",
            userName: item.profiles?.full_name || "Unknown",
            source: "referral",
            amount: 50,
            status: "rejected",
            createdAt: item.created_at,
            details: `Referred ${item.referred_email}`,
          })
        })
      }
    }

    if (statusFilter === "pending") {
      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          `
          id,
          user_id,
          created_at,
          total,
          status,
          profiles:user_id (
            email,
            full_name
          )
        `,
        )
        .eq("pending_credits", true)
        .in("status", ["processing", "completed"])

      if (ordersData) {
        ordersData.forEach((item: any) => {
          requests.push({
            id: item.id,
            userId: item.user_id,
            userEmail: item.profiles?.email || "Unknown",
            userName: item.profiles?.full_name || "Unknown",
            source: "order",
            amount: 15,
            status: "pending",
            createdAt: item.created_at,
            details: `Order #${item.id.slice(0, 8)} - EUR ${Number(item.total).toFixed(2)}`,
          })
        })
      }
    }

    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setCreditRequests(requests)
    setLoading(false)
  }

  const handleApprove = async (request: CreditRequest) => {
    setProcessingId(request.id)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("Not authenticated")
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (adminError) {
        throw adminError
      }

      if (adminProfile?.role !== "admin") {
        throw new Error("Insufficient permissions - not an admin")
      }

      if (request.source === "tiktok") {
        const { data: updateData, error } = await supabase
          .from("tiktok_submissions")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) {
          throw error
        }

        if (!updateData || updateData.length === 0) {
          throw new Error("Update failed - no data returned. Check RLS policies.")
        }

        toast({
          title: "Submission Approved",
          description: `User can now collect ${request.amount} credits from their account`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "trustpilot") {
        const { data: updateData, error } = await supabase
          .from("trustpilot_submissions")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) {
          throw error
        }

        if (!updateData || updateData.length === 0) {
          throw new Error("Update failed - no data returned. Check RLS policies.")
        }

        toast({
          title: "Submission Approved",
          description: `User can now collect ${request.amount} credits from their account`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "referral") {
        const { data: updateData, error } = await supabase
          .from("referrals")
          .update({ credits_awarded: request.amount, updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) {
          throw error
        }

        if (!updateData || updateData.length === 0) {
          throw new Error("Update failed - no data returned. Check RLS policies.")
        }

        toast({
          title: "Submission Approved",
          description: `User can now collect ${request.amount} credits from their account`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "order") {
        const { data: updateData, error } = await supabase
          .from("orders")
          .update({ pending_credits: false, updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) {
          throw error
        }

        if (!updateData || updateData.length === 0) {
          throw new Error("Update failed - no data returned. Check RLS policies.")
        }

        toast({
          title: "Submission Approved",
          description: `User can now collect ${request.amount} credits from their account`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve submission. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (request: CreditRequest) => {
    setProcessingId(request.id)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (adminProfile?.role !== "admin") {
        throw new Error("Insufficient permissions")
      }

      if (request.source === "tiktok") {
        const { data: updateData, error } = await supabase
          .from("tiktok_submissions")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) {
          throw error
        }

        if (!updateData || updateData.length === 0) {
          throw new Error("Update failed - check RLS policies")
        }

        toast({
          title: "Credits Declined",
          description: `Request from ${request.userName} has been declined`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "trustpilot") {
        const { data: updateData, error } = await supabase
          .from("trustpilot_submissions")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) throw error
        if (!updateData || updateData.length === 0) throw new Error("Update failed - check RLS policies")
        toast({
          title: "Credits Declined",
          description: `Request from ${request.userName} has been declined`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "referral") {
        const { data: updateData, error } = await supabase
          .from("referrals")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) throw error
        if (!updateData || updateData.length === 0) throw new Error("Update failed - check RLS policies")
        toast({
          title: "Credits Declined",
          description: `Request from ${request.userName} has been declined`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      } else if (request.source === "order") {
        const { data: updateData, error } = await supabase
          .from("orders")
          .update({ pending_credits: false, updated_at: new Date().toISOString() })
          .eq("id", request.id)
          .select()

        if (error) throw error
        if (!updateData || updateData.length === 0) throw new Error("Update failed - check RLS policies")
        toast({
          title: "Credits Declined",
          description: `Request from ${request.userName} has been declined`,
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        await fetchCreditRequests()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline credits",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    fetchCreditRequests()
  }, [statusFilter])

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-wide mb-1">Credits Management</h1>
          <p className="text-sm text-zinc-500">Review and approve pending credit requests</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-[#E5E5E5] rounded-md p-3">
            <p className="text-xs uppercase tracking-wide text-[#999] mb-1">{statusFilter} Requests</p>
            <p className="text-2xl font-medium text-black">{creditRequests.length}</p>
          </div>

          <div className="border border-[#E5E5E5] rounded-md p-3">
            <p className="text-xs uppercase tracking-wide text-[#999] mb-1">Total Credits</p>
            <p className="text-2xl font-medium text-black">
              {creditRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
            </p>
          </div>

          <div className="border border-[#E5E5E5] rounded-md p-3">
            <p className="text-xs uppercase tracking-wide text-[#999] mb-1">Sources</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBE4E4] text-[#D95757] font-medium">
                {creditRequests.filter((r) => r.source === "tiktok").length} TikTok
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8FDEE] text-[#16A34A] font-medium">
                {creditRequests.filter((r) => r.source === "trustpilot").length} Trustpilot
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8EAFE] text-[#4F46E5] font-medium">
                {creditRequests.filter((r) => r.source === "referral").length} Referral
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4E9FF] text-[#9333EA] font-medium">
                {creditRequests.filter((r) => r.source === "order").length} Order
              </span>
            </div>
          </div>
        </div>

        <div className="border border-[#E5E5E5] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="text-base font-medium">
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Credit Requests
            </h2>

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-md hover:bg-[#EFEFEF] text-sm font-medium"
              >
                STATUS: {statusFilter.toUpperCase()}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setStatusFilter("pending")
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FAFAFA] first:rounded-t-md ${
                      statusFilter === "pending" ? "bg-[#F5F5F5]" : ""
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("approved")
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FAFAFA] border-t border-[#E5E5E5] ${
                      statusFilter === "approved" ? "bg-[#F5F5F5]" : ""
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("declined")
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium hover:bg-[#FAFAFA] border-t border-[#E5E5E5] last:rounded-b-md ${
                      statusFilter === "declined" ? "bg-[#F5F5F5]" : ""
                    }`}
                  >
                    Declined
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDEDED]">
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">User</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">
                    Credits
                  </th>
                  {statusFilter !== "pending" && (
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">
                      Status
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">Date</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">Proof</th>
                  {statusFilter === "pending" && (
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-[#888] font-medium">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={statusFilter === "pending" ? 7 : 7} className="px-6 py-12 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-400" />
                    </td>
                  </tr>
                ) : creditRequests.length === 0 ? (
                  <tr>
                    <td colSpan={statusFilter === "pending" ? 7 : 7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full border-2 border-[#E5E5E5] flex items-center justify-center">
                          <Check className="w-6 h-6 text-[#999]" />
                        </div>
                        <p className="text-sm text-[#999]">No credit requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  creditRequests.map((request) => (
                    <tr key={request.id} className="border-b border-[#EDEDED] hover:bg-[#FAFAFA]">
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-black">{request.userName}</p>
                          <p className="text-xs text-[#9A9A9A]">{request.userEmail}</p>
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                            request.source === "trustpilot"
                              ? "bg-[#E8FDEE] text-[#16A34A]"
                              : request.source === "tiktok"
                                ? "bg-[#FBE4E4] text-[#D95757]"
                                : request.source === "referral"
                                  ? "bg-[#E8EAFE] text-[#4F46E5]"
                                  : "bg-[#F4E9FF] text-[#9333EA]"
                          }`}
                        >
                          {request.source.charAt(0).toUpperCase() + request.source.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-sm text-[#666]">{request.details}</td>

                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-black">{request.amount} Credits</span>
                      </td>

                      {statusFilter !== "pending" && (
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                              request.status === "approved"
                                ? "bg-[#E8FDEE] text-[#16A34A]"
                                : "bg-[#FEE2E2] text-[#DC2626]"
                            }`}
                          >
                            {request.status === "rejected"
                              ? "Declined"
                              : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                      )}

                      <td className="px-6 py-3 text-sm text-[#666]">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3">
                        {request.proofUrl ? (
                          <a
                            href={request.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#666] hover:text-black hover:underline"
                          >
                            View Proof
                          </a>
                        ) : (
                          <span className="text-sm text-[#999]">—</span>
                        )}
                      </td>

                      {statusFilter === "pending" && (
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                            </button>
                            <button
                              onClick={() => handleDecline(request)}
                              disabled={processingId === request.id}
                              className="px-3 py-1.5 bg-white border border-[#D95757] text-[#D95757] text-xs font-medium rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
