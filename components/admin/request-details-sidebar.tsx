"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ExternalLink } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"

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
}

type RequestDetailsSidebarProps = {
  isOpen: boolean
  onClose: () => void
  requestId: string
  onUpdate: () => void
}

export function RequestDetailsSidebar({ isOpen, onClose, requestId, onUpdate }: RequestDetailsSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [request, setRequest] = useState<ProductRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("pending")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    console.log("[v0] RequestDetailsSidebar useEffect - isOpen:", isOpen, "requestId:", requestId)
    if (requestId && isOpen) {
      fetchRequest()
    }
  }, [requestId, isOpen])

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    console.log("[v0] RequestDetailsSidebar animation useEffect - isOpen:", isOpen)

    if (isOpen) {
      console.log("[v0] Opening request sidebar with GSAP")
      sidebar.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"

      gsap.to(sidebar, {
        x: "0%",
        duration: 0.5,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
      })

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.2,
      })
    } else {
      gsap.to(sidebar, {
        x: "100%",
        duration: 0.5,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
        onComplete: () => {
          sidebar.style.pointerEvents = "none"
        },
      })

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          overlay.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  const fetchRequest = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("product_requests").select("*").eq("id", requestId).single()

    if (!error && data) {
      setRequest(data)
      setStatus(data.status)
      setAdminNotes(data.admin_notes || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!request) return

    setSaving(true)
    const { error } = await supabase
      .from("product_requests")
      .update({
        status: status,
        admin_notes: adminNotes,
      })
      .eq("id", request.id)

    if (!error) {
      onUpdate()
      onClose()
    } else {
      console.error("[v0] Error updating request:", error)
      alert("Failed to update request")
    }
    setSaving(false)
  }

  const handleOverlayClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 z-[99] opacity-0 pointer-events-none"
        onClick={handleOverlayClick}
      />

      {/* Request Details Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-[100svh] bg-white z-[100] flex flex-col pointer-events-none w-[35%] max-[900px]:w-full border-l border-[#E5E5E5]"
        style={{
          transform: "translateX(100%)",
          willChange: "transform",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-sm font-medium text-zinc-900">REQUEST #{requestId.slice(0, 8)}</h2>
            {request && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {new Date(request.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : request ? (
            <div className="space-y-6">
              <div className="bg-zinc-50 border border-[#E5E5E5] rounded-md p-4">
                <h3 className="text-xs font-medium tracking-wide uppercase text-zinc-500 mb-3">User Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-zinc-500">Name</span>
                    <span className="text-sm font-medium text-zinc-900 text-right">{request.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-zinc-500">Email</span>
                    <span className="text-sm text-zinc-900 text-right break-all">{request.customer_email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wide uppercase text-zinc-500 mb-3">
                  Product Request Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Product Name</label>
                    <p className="text-base font-medium text-zinc-900">{request.product_name}</p>
                  </div>
                  {request.brand && (
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Brand</label>
                      <p className="text-sm text-zinc-900">{request.brand}</p>
                    </div>
                  )}
                  {request.reference_link && (
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Reference Link</label>
                      <a
                        href={request.reference_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                      >
                        {request.reference_link}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                  {request.details && (
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1">Description / Notes</label>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{request.details}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wide uppercase text-zinc-500 mb-3">Provided Image</h3>
                {request.image_urls && request.image_urls.length > 0 ? (
                  <div className="space-y-2">
                    {request.image_urls.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="border border-[#E5E5E5] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(imageUrl)}
                      >
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Reference ${index + 1}`}
                          className="w-full max-h-[220px] object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-[#E5E5E5] rounded-md p-6 text-center">
                    <p className="text-sm text-zinc-400">No image provided</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wide uppercase text-zinc-500 mb-3">Internal Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "reviewing", "quoted", "completed", "rejected"].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => setStatus(statusOption)}
                      className={`px-4 py-2 text-xs font-medium tracking-wide uppercase rounded-md transition-colors ${
                        status === statusOption ? "bg-black text-white" : "bg-[#F2F2F2] text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium tracking-wide uppercase text-zinc-500 block mb-2">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  className="min-h-[120px] border-[#E5E5E5] text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 rounded-md resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-zinc-500">No request data available</p>
            </div>
          )}
        </div>

        {!loading && request && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:opacity-70"
          >
            ×
          </button>
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  )
}
