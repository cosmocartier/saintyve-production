"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, GripVertical, Trash2, Film, ImageIcon } from "lucide-react"
import Image from "next/image"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { createClient } from "@/lib/supabase/client"
import type { FactoryMediaItem } from "@/lib/types/product"

interface FactoryMediaManagerProps {
  productId: string
  initialMedia: FactoryMediaItem[]
  onUpdate?: () => void
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB, matches ProductVideos

export function FactoryMediaManager({ productId, initialMedia, onUpdate }: FactoryMediaManagerProps) {
  const [media, setMedia] = useState<FactoryMediaItem[]>(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch(`/api/admin/products/${productId}/factory-media`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { media: newMedia } = await response.json()
      setMedia((prev) => [...prev, ...newMedia])
      onUpdate?.()
    } catch (err) {
      console.error("[Factory Media] Image upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setUploading(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to upload videos")
      }

      const { data: existing } = await supabase
        .from("product_factory_media")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1)

      let nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1

      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("video/")) {
          throw new Error(`${file.name} is not a video file. Please select only video files.`)
        }

        if (file.size > MAX_VIDEO_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
          throw new Error(`${file.name} is ${sizeMB}MB. Videos must be less than 50MB.`)
        }

        const fileExt = file.name.split(".").pop()
        const fileName = `${productId}_factory_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `products/factory-media/${fileName}`

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath)

        const { data: mediaData, error: insertError } = await supabase
          .from("product_factory_media")
          .insert({
            product_id: productId,
            media_type: "video",
            video_url: publicUrl,
            sort_order: nextSortOrder++,
          })
          .select()
          .single()

        if (insertError) {
          await supabase.storage.from("product-images").remove([filePath])
          throw new Error(`Failed to save ${file.name} to database: ${insertError.message}`)
        }

        return mediaData as FactoryMediaItem
      })

      const newVideos = await Promise.all(uploadPromises)
      setMedia((prev) => [...prev, ...newVideos])
      onUpdate?.()
    } catch (err) {
      console.error("[Factory Media] Video upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload videos")
    } finally {
      setUploading(false)
      if (videoInputRef.current) {
        videoInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Delete this factory media item?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}/factory-media/${mediaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setMedia((prev) => prev.filter((item) => item.id !== mediaId))
      onUpdate?.()
    } catch (err) {
      console.error("[Factory Media] Delete error:", err)
      setError("Failed to delete media item")
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    setMedia((prev) => {
      const next = [...prev]
      const draggedItem = next[draggedIndex]
      next.splice(draggedIndex, 1)
      next.splice(index, 0, draggedItem)
      return next.map((item, idx) => ({ ...item, sort_order: idx }))
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const mediaIds = media.map((item) => item.id)
      const response = await fetch(`/api/admin/products/${productId}/factory-media/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder media")
      }

      onUpdate?.()
    } catch (err) {
      console.error("[Factory Media] Reorder error:", err)
      setError("Failed to save new media order")
    }

    setDraggedIndex(null)
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">
            Factory Media
          </h2>
          <p className="mt-1 font-sans text-[9px] text-white/25">
            Additional factory photos/videos shown to customers via a dedicated CTA on the product page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-40"
          >
            <ImageIcon size={12} />
            {uploading ? "Uploading..." : "Add Images"}
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-40"
          >
            <Film size={12} />
            {uploading ? "Uploading..." : "Add Videos"}
          </button>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        disabled={uploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/mov"
        multiple
        onChange={handleVideoUpload}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="mb-3 font-sans text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
          <Upload className="mx-auto mb-3 text-white/20" size={28} />
          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
            No factory media yet. Upload additional factory photos or videos for customers who want extra detail.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="relative group cursor-move"
            >
              <div className="rounded-xl border border-white/8 overflow-hidden">
                <div className="aspect-square relative">
                  {item.media_type === "image" && item.cf_image_id ? (
                    <Image
                      src={buildCfUrl(item.cf_image_id, "grid") || "/placeholder.svg"}
                      alt={item.alt_text || `Factory media ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : item.media_type === "video" && item.video_url ? (
                    <video src={item.video_url} className="w-full h-full object-cover" muted loop playsInline />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                      <ImageIcon className="text-white/15" size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500/80 text-white p-1.5 rounded-lg transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute top-1.5 left-1.5 rounded-lg bg-black/70 text-white px-1.5 py-0.5 font-sans text-[9px] font-medium">
                    {index + 1}
                  </div>
                  <div className="absolute top-1.5 right-1.5 rounded-lg bg-black/70 text-white/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={12} />
                  </div>
                  {item.media_type === "video" && (
                    <div className="absolute bottom-1.5 left-1.5 rounded-lg bg-black/70 text-white/80 p-1">
                      <Film size={11} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 font-sans text-[9px] text-white/25">
        Drag and drop to reorder. Deleting the last item automatically reverts the storefront CTA to the standard
        &quot;Request additional photos&quot; link.
      </p>
    </div>
  )
}
