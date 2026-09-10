"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Upload, X } from "lucide-react"
import { toast } from "sonner"

type CustomerResolutionClientProps = {
  caseId: string
  orderNumber: string
  unavailableItems: Array<{
    product_name: string
    variant: { size?: string; color?: string }
    quantity: number
  }>
  customerResponseReceived: boolean
}

export function CustomerResolutionClient({
  caseId,
  orderNumber,
  unavailableItems,
  customerResponseReceived: initialResponseReceived,
}: CustomerResolutionClientProps) {
  const [customerResponseReceived, setCustomerResponseReceived] = useState(initialResponseReceived)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolutionType, setResolutionType] = useState<"store_link" | "custom" | "refund">("store_link")
  const [productLink, setProductLink] = useState("")
  const [linkNotes, setLinkNotes] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [refundMethod, setRefundMethod] = useState<"iban" | "paypal">("iban")
  const [refundDetails, setRefundDetails] = useState("")
  const [refundName, setRefundName] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] handleFileChange triggered")
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log("[v0] File selected:", file.name, file.size, "bytes", file.type)
      setUploadedFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreviewUrl(previewUrl)
      console.log("[v0] Preview URL created:", previewUrl)
    }
    e.target.value = ""
  }

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] handleClearImage triggered")
    setUploadedFile(null)
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
    }
    console.log("[v0] Image cleared")
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("[v0] ========================================")
    console.log("[v0] SUBMIT BUTTON CLICKED")
    console.log("[v0] ========================================")
    console.log("[v0] Current state:")
    console.log("[v0] - Resolution type:", resolutionType)
    console.log("[v0] - Has uploaded file:", !!uploadedFile)
    console.log("[v0] - Product link:", productLink || "empty")
    console.log("[v0] - Custom description length:", customDescription.length)

    if (isSubmitting) {
      console.log("[v0] BLOCKED: Already submitting")
      return
    }

    if (resolutionType === "store_link" && !productLink.trim()) {
      console.log("[v0] BLOCKED: Missing product link")
      toast.error("Please provide a product link")
      return
    }

    if (resolutionType === "custom" && !customDescription.trim() && !uploadedFile) {
      console.log("[v0] BLOCKED: Missing description and image")
      toast.error("Please provide a description or upload an image of the item you'd like")
      return
    }

    if (resolutionType === "refund") {
      console.log("[v0] Opening refund modal...")
      setShowRefundModal(true)
      return
    }

    console.log("[v0] Validation passed, setting loading state...")
    setIsSubmitting(true)

    try {
      let imageUrl: string | null = null

      if (uploadedFile) {
        console.log("[v0] ========================================")
        console.log("[v0] STARTING IMAGE UPLOAD TO SERVER")
        console.log("[v0] ========================================")
        console.log("[v0] - File name:", uploadedFile.name)
        console.log("[v0] - File size:", uploadedFile.size, "bytes")

        try {
          const formData = new FormData()
          formData.append("file", uploadedFile)
          formData.append("caseId", caseId)

          console.log("[v0] Sending FormData to /api/investigations/upload-image...")

          const uploadResponse = await fetch("/api/investigations/upload-image", {
            method: "POST",
            body: formData,
          })

          console.log("[v0] Upload response status:", uploadResponse.status)

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            console.error("[v0] ✗ Upload failed:", errorData)
            throw new Error(errorData.error || "Failed to upload image")
          }

          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.imageUrl
          console.log("[v0] ✓ Image uploaded successfully!")
          console.log("[v0] ✓ Image URL:", imageUrl)
        } catch (uploadError) {
          console.error("[v0] ✗ Image upload FAILED:", uploadError)
          toast.error("Failed to upload image. Please try again.")
          setIsSubmitting(false)
          return
        }
      } else {
        console.log("[v0] No image to upload, skipping...")
      }

      console.log("[v0] ========================================")
      console.log("[v0] SUBMITTING TO API")
      console.log("[v0] ========================================")

      const requestBody = {
        caseId,
        resolutionType,
        productLink: resolutionType === "store_link" ? productLink : null,
        linkNotes: resolutionType === "store_link" ? linkNotes : null,
        customDescription: resolutionType === "custom" ? customDescription : null,
        imageUrl,
      }
      console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/investigations/customer-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)

      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (!response.ok) {
        console.error("[v0] ✗ API returned error")
        throw new Error(responseData.error || "Failed to submit response")
      }

      console.log("[v0] ========================================")
      console.log("[v0] ✓ SUBMISSION SUCCESSFUL")
      console.log("[v0] ========================================")

      setCustomerResponseReceived(true)
      toast.success("Your request has been submitted successfully")
    } catch (error) {
      console.error("[v0] ========================================")
      console.error("[v0] ✗ SUBMISSION FAILED")
      console.error("[v0] ========================================")
      console.error("[v0] Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
      console.log("[v0] Set isSubmitting to false")
    }
  }

  const handleRefundSubmit = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund")
      return
    }

    if (!refundDetails.trim()) {
      toast.error(`Please provide your ${refundMethod === "iban" ? "IBAN" : "PayPal email"}`)
      return
    }

    if (refundMethod === "iban" && !refundName.trim()) {
      toast.error("Please provide the account holder name")
      return
    }

    setIsSubmitting(true)
    setShowRefundModal(false)

    try {
      console.log("[v0] Submitting refund request...")

      const requestBody = {
        caseId,
        resolutionType: "refund",
        refundReason,
        refundMethod,
        refundDetails,
        refundName: refundMethod === "iban" ? refundName : null,
      }

      console.log("[v0] Refund request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/investigations/customer-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit refund request")
      }

      setCustomerResponseReceived(true)
      toast.success("Your refund request has been submitted successfully")
    } catch (error) {
      console.error("[v0] Refund submission failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit refund request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (customerResponseReceived) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-lg w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-medium text-zinc-900 mb-3">Request Received</h1>
          <p className="text-sm text-zinc-600 mb-6">
            Thanks for your response! We've received your request and will review it as soon as possible. You'll receive
            a confirmation email once we've processed your request.
          </p>
          <p className="text-xs text-zinc-500">Order #{orderNumber}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-[850px] mx-auto space-y-6">
        <div className="bg-white border border-[#E6E6E6] rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-normal text-zinc-900 mb-3">Order Item Unavailable</h1>
          <p className="text-sm text-zinc-500 mb-1">Order #{orderNumber}</p>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Unfortunately, an item from your order is currently unavailable. Please choose an alternative below.
          </p>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-2xl p-8 shadow-sm">
          <h2 className="text-xs uppercase tracking-wide text-zinc-400 mb-4">
            {unavailableItems.length === 1 ? "Unavailable item" : "Unavailable items"}
          </h2>
          <div className="space-y-3">
            {unavailableItems.map((item, index) => (
              <div key={index} className="p-4 bg-[#FFF5F5] border border-[#F8D7DA] rounded-xl">
                <p className="text-sm font-normal text-zinc-900">{item.product_name}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {item.variant?.size && `${item.variant.size}`}
                  {item.variant?.color && ` • ${item.variant.color}`}
                  {` • Qty ${item.quantity}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-normal text-zinc-900 mb-2">Choose your alternative</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Select another item from our store, describe a custom item, or request a refund.
          </p>

          <RadioGroup value={resolutionType} onValueChange={(value: any) => setResolutionType(value)} className="mb-6">
            <div
              className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                resolutionType === "store_link"
                  ? "border-zinc-900 shadow-sm bg-white"
                  : "border-[#E6E6E6] bg-white hover:border-zinc-300"
              }`}
            >
              <RadioGroupItem value="store_link" id="store_link" />
              <Label htmlFor="store_link" className="flex-1 cursor-pointer">
                <span className="font-normal text-zinc-900">Choose from store</span>
                <p className="text-xs text-zinc-500 mt-0.5">Paste a product link from designerdrip.store</p>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                resolutionType === "custom"
                  ? "border-zinc-900 shadow-sm bg-white"
                  : "border-[#E6E6E6] bg-white hover:border-zinc-300"
              }`}
            >
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex-1 cursor-pointer">
                <span className="font-normal text-zinc-900">Custom item request</span>
                <p className="text-xs text-zinc-500 mt-0.5">Describe an item you'd like us to source</p>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                resolutionType === "refund"
                  ? "border-zinc-900 shadow-sm bg-white"
                  : "border-[#E6E6E6] bg-white hover:border-zinc-300"
              }`}
            >
              <RadioGroupItem value="refund" id="refund" />
              <Label htmlFor="refund" className="flex-1 cursor-pointer">
                <span className="font-normal text-zinc-900">Request a refund</span>
                <p className="text-xs text-zinc-500 mt-0.5">Get your money back for unavailable items</p>
              </Label>
            </div>
          </RadioGroup>

          {resolutionType === "store_link" ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="productLink" className="text-sm font-normal text-zinc-700 mb-2 block">
                  Product Link *
                </Label>
                <Input
                  id="productLink"
                  type="url"
                  placeholder="https://designerdrip.store/products/..."
                  value={productLink}
                  onChange={(e) => setProductLink(e.target.value)}
                  className="placeholder:text-zinc-400"
                />
              </div>
              <div>
                <Label htmlFor="linkNotes" className="text-sm font-normal text-zinc-700 mb-2 block">
                  Size / Color / Other Details (Optional)
                </Label>
                <Input
                  id="linkNotes"
                  placeholder="e.g., Size L, Black color"
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  className="placeholder:text-zinc-400"
                />
              </div>
            </div>
          ) : resolutionType === "custom" ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="customDescription" className="text-sm font-normal text-zinc-700 mb-2 block">
                  Describe the Item *
                </Label>
                <Textarea
                  id="customDescription"
                  placeholder="Please describe the item in detail: brand, model, size, color, etc."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={5}
                  className="placeholder:text-zinc-400"
                />
              </div>
              <div>
                <Label className="text-sm font-normal text-zinc-700 mb-2 block">Upload Image (Optional)</Label>
                {imagePreviewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-40 h-auto rounded-lg shadow-sm border border-zinc-200"
                    />
                    <p className="text-xs text-zinc-500 mt-2 max-w-[160px] truncate">{uploadedFile?.name}</p>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-md hover:bg-zinc-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-600" />
                    </button>
                    <div className="mt-3">
                      <label
                        htmlFor="fileUpload"
                        className="text-sm text-zinc-600 underline cursor-pointer hover:text-zinc-900"
                      >
                        Change image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-xl hover:border-zinc-400 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-zinc-400 mb-2" />
                    <p className="text-sm font-normal text-zinc-600">Upload image (optional)</p>
                    <p className="text-xs text-zinc-400 mt-1">PNG, JPG up to 5MB</p>
                  </label>
                )}
                <input id="fileUpload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900 font-medium mb-1">Ready to request a refund?</p>
                <p className="text-xs text-amber-700">
                  Click the button below to open the refund request form. We'll review and process the refund within 3-5
                  business days.
                </p>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 bg-black hover:bg-zinc-800 rounded-full h-11 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting…" : resolutionType === "refund" ? "Continue to Refund Form" : "Submit Request"}
          </Button>
        </div>
      </div>

      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal">Request Refund</DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Please provide details for your refund request. We'll review and process it as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label htmlFor="refundReason" className="text-sm font-normal text-zinc-700 mb-2 block">
                Reason for Refund *
              </Label>
              <Textarea
                id="refundReason"
                placeholder="Please explain why you're requesting a refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                className="placeholder:text-zinc-400"
              />
            </div>

            <div>
              <Label htmlFor="refundMethod" className="text-sm font-normal text-zinc-700 mb-2 block">
                Refund Method *
              </Label>
              <Select value={refundMethod} onValueChange={(value: any) => setRefundMethod(value)}>
                <SelectTrigger id="refundMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iban">Bank Transfer (IBAN)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {refundMethod === "iban" && (
              <>
                <div>
                  <Label htmlFor="refundName" className="text-sm font-normal text-zinc-700 mb-2 block">
                    Name *
                  </Label>
                  <Input
                    id="refundName"
                    placeholder="Full name of account holder"
                    value={refundName}
                    onChange={(e) => setRefundName(e.target.value)}
                    className="placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <Label htmlFor="refundDetails" className="text-sm font-normal text-zinc-700 mb-2 block">
                    IBAN *
                  </Label>
                  <Input
                    id="refundDetails"
                    placeholder="DE89 3704 0044 0532 0130 00"
                    value={refundDetails}
                    onChange={(e) => setRefundDetails(e.target.value)}
                    className="placeholder:text-zinc-400 font-mono"
                  />
                </div>
              </>
            )}

            {refundMethod === "paypal" && (
              <div>
                <Label htmlFor="refundDetails" className="text-sm font-normal text-zinc-700 mb-2 block">
                  PayPal Email *
                </Label>
                <Input
                  id="refundDetails"
                  type="email"
                  placeholder="your.email@example.com"
                  value={refundDetails}
                  onChange={(e) => setRefundDetails(e.target.value)}
                  className="placeholder:text-zinc-400"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRefundModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRefundSubmit}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800"
                disabled={isSubmitting}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
