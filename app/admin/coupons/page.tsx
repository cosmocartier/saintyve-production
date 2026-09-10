"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createBrowserClient } from "@/lib/supabase/client"
import { Search, Edit2, Trash2, Tag, X } from "lucide-react"

interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  user_email: string | null
  instagram_tag: string | null
  enabled: boolean
  usage_limit: number | null
  times_used: number
  valid_from: string
  valid_until: string | null
  minimum_order_value: number
  created_at: string
}

interface CouponFormData {
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  user_email: string
  usage_limit: string
  minimum_order_value: number
  enabled: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    user_email: "",
    usage_limit: "",
    minimum_order_value: 0,
    enabled: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching coupons:", error)
    } else {
      setCoupons(data || [])
    }
    setIsLoading(false)
  }

  const handleToggleEnabled = async (coupon: Coupon) => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from("coupons").update({ enabled: !coupon.enabled }).eq("id", coupon.id)

    if (error) {
      console.error("[v0] Error updating coupon:", error)
      alert("Failed to update coupon")
    } else {
      fetchCoupons()
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    const supabase = createBrowserClient()
    const { error } = await supabase.from("coupons").delete().eq("id", couponId)

    if (error) {
      console.error("[v0] Error deleting coupon:", error)
      alert("Failed to delete coupon")
    } else {
      fetchCoupons()
    }
  }

  const handleNewCoupon = () => {
    setEditingCoupon(null)
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      user_email: "",
      usage_limit: "",
      minimum_order_value: 0,
      enabled: true,
    })
    setShowModal(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      user_email: coupon.user_email || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      minimum_order_value: coupon.minimum_order_value,
      enabled: coupon.enabled,
    })
    setShowModal(true)
  }

  const handleSaveCoupon = async () => {
    setIsSaving(true)
    const supabase = createBrowserClient()

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      user_email: formData.user_email || null,
      usage_limit: formData.usage_limit ? Number.parseInt(formData.usage_limit) : null,
      minimum_order_value: formData.minimum_order_value,
      enabled: formData.enabled,
      valid_from: new Date().toISOString(),
    }

    let error
    if (editingCoupon) {
      // Update existing coupon
      const result = await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id)
      error = result.error
    } else {
      // Create new coupon
      const result = await supabase.from("coupons").insert({ ...couponData, times_used: 0 })
      error = result.error
    }

    setIsSaving(false)

    if (error) {
      console.error("[v0] Error saving coupon:", error)
      alert("Failed to save coupon")
    } else {
      setShowModal(false)
      fetchCoupons()
    }
  }

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.instagram_tag?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar userEmail="" />
        <div className="flex-1 p-8">
          <p>Loading coupons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar userEmail="" />

      <div className="flex-1 p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">COUPONS</h1>
            <p className="text-sm text-zinc-500 tracking-wide">Manage discount codes and promotions</p>
          </div>
          <button
            onClick={handleNewCoupon}
            className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors"
          >
            New coupon
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, email, or Instagram tag…"
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
            />
          </div>
        </div>

        {filteredCoupons.length > 0 ? (
          <div className="border border-zinc-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      CODE
                    </th>
                    <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      TYPE
                    </th>
                    <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      VALUE
                    </th>
                    <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      ASSIGNED TO
                    </th>
                    <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      USAGE
                    </th>
                    <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      MIN ORDER
                    </th>
                    <th className="px-4 py-3 text-left text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      STATUS
                    </th>
                    <th className="px-4 py-3 text-right text-xs tracking-wider uppercase text-zinc-500 font-medium">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEDED]">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 capitalize">{coupon.discount_type}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `EUR ${coupon.discount_value}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.user_email ? (
                          <span className="text-zinc-600">{coupon.user_email}</span>
                        ) : coupon.instagram_tag ? (
                          <span className="text-zinc-600">{coupon.instagram_tag}</span>
                        ) : (
                          <span className="text-gray-400">Public</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums">
                        {coupon.times_used} / {coupon.usage_limit || "∞"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums">
                        EUR {coupon.minimum_order_value.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${
                            coupon.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {coupon.enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-md bg-zinc-50 py-16 text-center">
            <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-medium text-gray-900 mb-1">No coupons yet.</p>
            <p className="text-sm text-gray-500 mb-6">Create your first coupon to start running promotions.</p>
            <button
              onClick={handleNewCoupon}
              className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors"
            >
              New coupon
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-wide">{editingCoupon ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME10"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })
                    }
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">
                    {formData.discount_type === "percentage" ? "Discount (%)" : "Discount (EUR)"}
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: Number.parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">
                    Usage limit
                  </label>
                  <input
                    type="text"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="∞ (unlimited)"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">
                    Assigned to
                  </label>
                  <input
                    type="text"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder="Leave empty for public"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  />
                </div>

                {/* Minimum Order Value */}
                <div>
                  <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">
                    Minimum order (EUR)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_order_value}
                    onChange={(e) =>
                      setFormData({ ...formData, minimum_order_value: Number.parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:border-black focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <label className="block text-xs font-medium tracking-wider uppercase text-zinc-500 mb-2">Status</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, enabled: true })}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                      formData.enabled
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-[#E5E5E5] hover:border-gray-400"
                    }`}
                  >
                    Enabled
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, enabled: false })}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                      !formData.enabled
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-[#E5E5E5] hover:border-gray-400"
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">Changes are applied immediately after saving.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCoupon}
                  disabled={isSaving || !formData.code}
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
