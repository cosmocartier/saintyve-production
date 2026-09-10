"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, CheckCircle2 } from "lucide-react"

export default function RequestProductPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    referenceLink: "",
    details: "",
    name: "",
    email: "",
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)
      // Pre-fill name and email from user profile
      const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          name: profile.full_name || "",
          email: profile.email || user.email || "",
        }))
      }
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || uploadedImages.length >= 1) return

    setUploadingImage(true)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setUploadedImages([url])
    } catch (err) {
      console.error("[v0] Image upload error:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.productName.trim() || !formData.details.trim() || !formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/product-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: formData.productName,
          brand: formData.brand,
          reference_link: formData.referenceLink,
          details: formData.details,
          image_urls: uploadedImages,
          customer_name: formData.name,
          customer_email: formData.email,
          user_id: user?.id || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit request")
      }

      setSuccess(true)
      // Reset form
      setFormData({
        productName: "",
        brand: "",
        referenceLink: "",
        details: "",
        name: user ? formData.name : "",
        email: user ? formData.email : "",
      })
      setUploadedImages([])
    } catch (err) {
      console.error("[v0] Submit error:", err)
      setError("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <CartSidebar />
      <StaticNavigation />

      <div className="max-w-[640px] mx-auto px-4 py-8 md:py-12 mt-20">
        {success ? (
          <div className="bg-white rounded-[10px] p-8 md:p-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#4CAF50] mx-auto mb-4" />
            <h1 className="text-[24px] md:text-[28px] font-medium text-black mb-3">Request Received</h1>
            <p className="text-[15px] text-[#555] leading-relaxed mb-6">
              Thank you for your product request. We'll review your details and get back to you within 24–48 hours.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-black text-white h-12 px-8 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] p-6 md:p-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-[24px] md:text-[28px] font-medium text-black mb-2">Request a Product</h1>
              <p className="text-[15px] text-[#555] leading-relaxed">
                Send us details and reference photos of the item you're looking for.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-2">
                  Product Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white"
                  placeholder="e.g., Louis Vuitton Keepall 55"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white"
                  placeholder="e.g., Louis Vuitton"
                />
              </div>

              {/* Reference Link */}
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-2">Reference Link</label>
                <input
                  type="url"
                  value={formData.referenceLink}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                  className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white"
                  placeholder="https://..."
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-2">
                  Details<span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white resize-none"
                  placeholder="Please include size, color, condition, budget, and any other relevant details..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-2">Reference Image</label>
                <div className="space-y-3">
                  {uploadedImages.length > 0 && (
                    <div className="relative aspect-square max-w-[200px] bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={uploadedImages[0] || "/placeholder.svg"}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedImages([])}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  {uploadedImages.length === 0 && (
                    <label className="flex items-center justify-center gap-2 h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] text-[#555] hover:border-black transition-colors cursor-pointer bg-white">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-[13px] text-[#777]">JPG, PNG, or WEBP. Single image only.</p>
                </div>
              </div>

              {/* Name and Email */}
              {user ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[14px] font-medium text-[#333] mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      readOnly
                      className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] bg-[#F7F7F7] text-[#777]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#333] mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] bg-[#F7F7F7] text-[#777]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[14px] font-medium text-[#333] mb-2">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#333] mb-2">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 px-4 border border-[#E5E5E5] rounded-md text-[15px] placeholder:text-[#A0A0A0] focus:border-black focus:outline-none transition-colors bg-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-[14px] text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {submitting ? "Sending Request..." : "Send Request"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
