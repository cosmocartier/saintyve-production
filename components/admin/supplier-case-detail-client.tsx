"use client"

import { useState } from "react"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Clock, Mail, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

type CaseDetailProps = {
  caseData: any
  orderItems: any[]
  customerResolution?: any
}

export function SupplierCaseDetailClient({ caseData, orderItems, customerResolution }: CaseDetailProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isEdited, setIsEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    status: caseData.status,
    priority: caseData.priority,
    internal_notes: caseData.internal_notes || "",
  })

  const parseUnavailableItems = () => {
    try {
      const match = caseData.description?.match(/Unavailable Items: (.+?)(?:\n|$)/)
      if (match) {
        const jsonStr = match[1]
        return JSON.parse(jsonStr)
      }
    } catch (e) {
      return []
    }
    return []
  }

  const parseMetadata = () => {
    try {
      const match = caseData.description?.match(/Metadata: ({.+})$/)
      if (match) {
        return JSON.parse(match[1])
      }
    } catch (e) {
      return null
    }
    return null
  }

  const unavailableItems = parseUnavailableItems()
  const metadata = parseMetadata()

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsEdited(true)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("investigation_cases")
        .update({
          status: formData.status,
          priority: formData.priority,
          internal_notes: formData.internal_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseData.id)

      if (error) throw error

      toast.success("Case updated successfully")
      setIsEdited(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating case:", error)
      toast.error("Failed to update case")
    } finally {
      setIsSaving(false)
    }
  }

  const handleApproveReplacement = async () => {
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("investigation_cases")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseData.id)

      if (error) throw error

      const customerEmail = caseData.orders.profiles?.email || caseData.orders.customer_email
      const customerName = caseData.orders.profiles?.full_name || caseData.orders.customer_name || "Customer"
      const orderNumber = caseData.orders.id.slice(0, 8).toUpperCase()

      const emailResponse = await fetch("/api/investigations/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          customerName,
          orderNumber,
          replacementItem: {
            type: customerResolution?.resolution_type || "store_link",
            productLink: customerResolution?.product_link,
            description: customerResolution?.custom_description,
          },
        }),
      })

      if (!emailResponse.ok) {
        console.error("[v0] Failed to send confirmation email")
      }

      toast.success("Replacement approved and customer notified")
      router.refresh()
    } catch (error) {
      console.error("Error approving replacement:", error)
      toast.error("Failed to approve replacement")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700"
      case "in_progress":
        return "bg-blue-50 text-blue-700"
      case "resolved":
        return "bg-green-50 text-green-700"
      default:
        return "bg-zinc-100 text-zinc-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700"
      case "high":
        return "bg-orange-50 text-orange-700"
      case "medium":
        return "bg-zinc-100 text-zinc-700"
      default:
        return "bg-zinc-50 text-zinc-600"
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <SupplierSidebar />

      <main className="flex-1 ml-64">
        <div className="max-w-[1600px] mx-auto h-full p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.push("/admin/supplier/investigations")}
              variant="ghost"
              className="mb-4 -ml-2 text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Investigations
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-normal text-zinc-900 mb-2">
                  Investigation Case #{caseData.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-sm text-zinc-500">Created on {formatDate(caseData.created_at)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getPriorityColor(caseData.priority)}`}>
                  {caseData.priority.charAt(0).toUpperCase() + caseData.priority.slice(1)} Priority
                </span>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(caseData.status)}`}>
                  {caseData.status.replace("_", " ").charAt(0).toUpperCase() +
                    caseData.status.replace("_", " ").slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* LEFT COLUMN - Order Summary + Customer Response + Order Items */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-5 h-5 text-zinc-400" />
                  <h2 className="text-lg font-medium text-zinc-900">Order Summary</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Order Number</span>
                    <span className="text-sm font-medium text-zinc-900">#{caseData.order_id.slice(0, 8)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Order Date</span>
                    <span className="text-sm text-zinc-600">
                      {new Date(caseData.orders.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Customer</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-900">
                        {caseData.orders.profiles?.full_name || caseData.orders.customer_name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {caseData.orders.profiles?.email || caseData.orders.customer_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Total Amount</span>
                    <span className="text-sm font-medium text-zinc-900">€{caseData.orders.total?.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Supplier Status</span>
                    <span className="text-sm font-medium text-zinc-900">
                      {caseData.orders.supplier_status || "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {customerResolution ? (
                <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                  <h2 className="text-lg font-medium text-zinc-900 mb-6">Customer Response</h2>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        Response Type
                      </Label>
                      <p className="text-sm text-zinc-900">
                        {customerResolution.resolution_type === "store_link"
                          ? "Selected replacement from store"
                          : customerResolution.resolution_type === "custom_request"
                            ? "Uploaded custom reference"
                            : "Refund request"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        Submitted At
                      </Label>
                      <p className="text-sm text-zinc-900">{formatDate(customerResolution.created_at)}</p>
                    </div>

                    {customerResolution.resolution_type === "refund_request" && (
                      <>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-900">
                              Customer has requested a refund. Please process manually through your payment provider.
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                            Refund Method
                          </Label>
                          <p className="text-sm text-zinc-900 capitalize">
                            {customerResolution.refund_method?.replace("_", " ") || "Not specified"}
                          </p>
                        </div>

                        {customerResolution.refund_name && (
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                              Account Holder Name
                            </Label>
                            <p className="text-sm text-zinc-900">{customerResolution.refund_name}</p>
                          </div>
                        )}

                        {customerResolution.refund_details && (
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                              {customerResolution.refund_method === "iban"
                                ? "IBAN"
                                : customerResolution.refund_method === "paypal"
                                  ? "PayPal Email"
                                  : "Details"}
                            </Label>
                            <p className="text-sm text-zinc-900 font-mono break-all">
                              {customerResolution.refund_details}
                            </p>
                          </div>
                        )}

                        <div>
                          <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                            Reason
                          </Label>
                          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                            {customerResolution.refund_reason}
                          </p>
                        </div>
                      </>
                    )}

                    {customerResolution.resolution_type === "store_link" && customerResolution.product_link && (
                      <>
                        <div>
                          <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                            Product Link
                          </Label>
                          <a
                            href={customerResolution.product_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {customerResolution.product_link}
                          </a>
                        </div>
                        {customerResolution.link_notes && (
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                              Additional Notes
                            </Label>
                            <p className="text-sm text-zinc-700 leading-relaxed">{customerResolution.link_notes}</p>
                          </div>
                        )}
                      </>
                    )}

                    {customerResolution.resolution_type === "custom_request" && (
                      <>
                        {customerResolution.custom_description && (
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">
                              Item Description
                            </Label>
                            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                              {customerResolution.custom_description}
                            </p>
                          </div>
                        )}
                        {customerResolution.image_url && (
                          <div>
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">
                              Reference Image
                            </Label>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-200">
                              <Image
                                src={customerResolution.image_url || "/placeholder.svg"}
                                alt="Customer reference"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {caseData.status !== "resolved" && customerResolution.resolution_type !== "refund_request" && (
                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleApproveReplacement}
                          disabled={isSaving}
                          className="flex-1 bg-black hover:bg-zinc-800 text-white"
                        >
                          {isSaving ? "Approving..." : "Approve Replacement"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => toast.info("Request new choice feature coming soon")}
                        >
                          Ask for New Choice
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                  <h2 className="text-lg font-medium text-zinc-900 mb-4">Customer Response</h2>
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-zinc-700 mb-1">No customer response yet.</p>
                    <p className="text-xs text-zinc-500">
                      We'll update this section as soon as the customer submits their replacement choice.
                    </p>
                  </div>
                </div>
              )}

              {unavailableItems.length > 0 && (
                <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                  <h3 className="text-lg font-medium text-zinc-900 mb-4">Unavailable Items</h3>
                  <div className="space-y-3">
                    {unavailableItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">{item.product_name || item.name}</p>
                          {item.variant && <p className="text-xs text-zinc-500 mt-1">{item.variant}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items Card */}
              <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                <h3 className="text-lg font-medium text-zinc-900 mb-4">All Order Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => {
                    const isUnavailable = unavailableItems.some((ui: any) => ui.id === item.id)

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isUnavailable ? "bg-red-50 border border-red-200" : "bg-zinc-50"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">
                            {item.products?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {item.product_variants?.size && `Size: ${item.product_variants.size}`}
                            {item.product_variants?.color && ` • Color: ${item.product_variants.color}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-600">Qty: {item.quantity}</p>
                          <p className="text-xs text-zinc-500">€{item.price?.toFixed(2)}</p>
                        </div>
                        {isUnavailable && (
                          <div className="ml-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Case Details + System Activity */}
            <div className="space-y-6">
              {/* Case Details Card */}
              <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                <h2 className="text-lg font-medium text-zinc-900 mb-6">Case Details</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium text-zinc-700">
                      Priority
                    </Label>
                    <Select value={formData.priority} onValueChange={(value) => handleFieldChange("priority", value)}>
                      <SelectTrigger className="mt-1.5">
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

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-zinc-700">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => handleFieldChange("status", value)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="internal_notes" className="text-sm font-medium text-zinc-700">
                      Internal Notes
                    </Label>
                    <Textarea
                      id="internal_notes"
                      value={formData.internal_notes}
                      onChange={(e) => handleFieldChange("internal_notes", e.target.value)}
                      rows={6}
                      className="mt-1.5"
                      placeholder="Add internal notes for this case…"
                    />
                  </div>

                  {isEdited && (
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="w-full bg-black hover:bg-zinc-800"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>

              {metadata && (
                <div className="border border-zinc-200 rounded-[14px] p-6 shadow-sm bg-white">
                  <h2 className="text-sm font-medium text-zinc-900 mb-4">System Activity</h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {metadata.emailSent ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-zinc-400" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-zinc-600">Email sent to customer</p>
                        <p className="text-xs font-medium text-zinc-900">{metadata.emailSent ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    {metadata.tokenCreatedAt && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <div className="flex-1">
                          <p className="text-xs text-zinc-600">Token created at</p>
                          <p className="text-xs font-medium text-zinc-900">{formatDate(metadata.tokenCreatedAt)}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {metadata.customerResponseReceived ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-zinc-400" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-zinc-600">Customer response received</p>
                        <p className="text-xs font-medium text-zinc-900">
                          {metadata.customerResponseReceived ? "Yes" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
