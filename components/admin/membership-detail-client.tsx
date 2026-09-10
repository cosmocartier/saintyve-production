"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, CheckCircle2, XCircle, Clock, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MembershipDetailClientProps {
  membership: any
  rewards: any[]
}

export default function MembershipDetailClient({ membership, rewards }: MembershipDetailClientProps) {
  const [status, setStatus] = useState(membership.status)
  const [cardFrontUrl, setCardFrontUrl] = useState(membership.card_front_url || "")
  const [cardBackUrl, setCardBackUrl] = useState(membership.card_back_url || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

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

  const getRewardStatusIcon = (status: string) => {
    switch (status) {
      case "claimed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const handleImageUpload = async (file: File, side: "front" | "back") => {
    setIsUploading(true)
    try {
      console.log(`[v0] Starting ${side} card upload for membership ${membership.id}`)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("membershipId", membership.id)
      formData.append("side", side)

      const response = await fetch("/api/admin/memberships/upload-card-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      console.log(`[v0] Successfully uploaded ${side} card image:`, data.url)

      if (side === "front") {
        setCardFrontUrl(data.url)
      } else {
        setCardBackUrl(data.url)
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    // Guard: Both images must be present to change status
    if (!cardFrontUrl || !cardBackUrl) {
      alert("Please upload both front and back images of the membership card before changing the status.")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/memberships/${membership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          card_front_url: cardFrontUrl,
          card_back_url: cardBackUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update membership")
      }

      alert("Membership updated successfully!")
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error updating membership:", error)
      alert("Failed to update membership. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    status !== membership.status ||
    cardFrontUrl !== (membership.card_front_url || "") ||
    cardBackUrl !== (membership.card_back_url || "")
  const canSave = cardFrontUrl && cardBackUrl && hasChanges

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/memberships"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Memberships
          </Link>
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">MEMBERSHIP DETAILS</h1>
          <p className="text-sm text-zinc-500 tracking-wide">View and manage member loyalty data</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Member Summary & Rewards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Summary */}
            <div className="border border-black/10 p-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-900 mb-4">MEMBER SUMMARY</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member ID</p>
                  <p className="font-mono text-sm font-medium">{membership.member_id}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm">{membership.profile.email}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Status</p>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(membership.status)}`}
                  >
                    {membership.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    {formatDate(membership.member_since)}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Valid Until</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    {formatDate(membership.valid_until)}
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="border border-black/10 p-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-900 mb-4">LOYALTY REWARDS</h2>

              {rewards.length === 0 ? (
                <p className="text-sm text-zinc-500">No rewards assigned yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Reward</th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">Created</th>
                        <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-zinc-500">
                          Collected
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {rewards.map((reward) => (
                        <tr key={reward.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-zinc-900">{reward.reward.title}</p>
                            <p className="text-xs text-zinc-500">{reward.reward.reward_type}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRewardStatusIcon(reward.status)}
                              <span className="text-sm capitalize">{reward.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">{formatDate(reward.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-zinc-600">
                            {reward.claimed_at ? formatDate(reward.claimed_at) : "–"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Membership Status & Cards */}
          <div className="space-y-6">
            <div className="border border-black/10 p-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-900 mb-4">
                MEMBERSHIP STATUS & CARD
              </h2>

              {/* Status Selector */}
              <div className="mb-6">
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Change Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm capitalize"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="black">Black</option>
                </select>
              </div>

              {/* Card Upload Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Card Front Side</label>
                  {cardFrontUrl ? (
                    <div className="relative">
                      <Image
                        src={cardFrontUrl || "/placeholder.svg"}
                        alt="Card Front"
                        width={300}
                        height={180}
                        className="w-full rounded-lg border border-black/10"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full bg-transparent"
                        onClick={() => document.getElementById("front-upload")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed bg-transparent"
                      onClick={() => document.getElementById("front-upload")?.click()}
                      disabled={isUploading}
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                        <span className="text-sm text-zinc-600">Upload Front Side</span>
                      </div>
                    </Button>
                  )}
                  <input
                    id="front-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "front")
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Card Back Side</label>
                  {cardBackUrl ? (
                    <div className="relative">
                      <Image
                        src={cardBackUrl || "/placeholder.svg"}
                        alt="Card Back"
                        width={300}
                        height={180}
                        className="w-full rounded-lg border border-black/10"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full bg-transparent"
                        onClick={() => document.getElementById("back-upload")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed bg-transparent"
                      onClick={() => document.getElementById("back-upload")?.click()}
                      disabled={isUploading}
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                        <span className="text-sm text-zinc-600">Upload Back Side</span>
                      </div>
                    </Button>
                  )}
                  <input
                    id="back-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "back")
                    }}
                  />
                </div>
              </div>

              {/* Helper Text */}
              {(!cardFrontUrl || !cardBackUrl) && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs text-amber-800">
                    Upload both front and back images of the membership card before changing the member's status.
                  </p>
                </div>
              )}

              {/* Save Button */}
              <Button className="w-full mt-6" onClick={handleSave} disabled={!canSave || isSaving || isUploading}>
                {isSaving ? "Saving..." : "Update Membership"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
