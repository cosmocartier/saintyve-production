"use client"

import type React from "react"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, GripVertical } from "lucide-react"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import type { ReviewMediaItem } from "@/lib/types/review"

interface ReviewMediaProps {
  value: ReviewMediaItem[]
  onChange: (media: ReviewMediaItem[]) => void
}

export function ReviewMedia({ value, onChange }: ReviewMediaProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append("files", file))

      const response = await fetch("/api/admin/reviews/media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { images } = await response.json()
      const nextSortOrder = value.length

      const newItems: ReviewMediaItem[] = images.map((img: { cf_image_id: string }, i: number) => ({
        id: crypto.randomUUID(),
        cf_image_id: img.cf_image_id,
        alt_text: null,
        sort_order: nextSortOrder + i,
      }))

      onChange([...value, ...newItems])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemove = async (item: ReviewMediaItem) => {
    onChange(value.filter((m) => m.id !== item.id))
    // Fire and forget — matches the product Cloudflare image deletion pattern.
    fetch(`/api/admin/reviews/media?cfImageId=${item.cf_image_id}`, { method: "DELETE" }).catch((err) => {
      console.error("[v0] Failed to delete review media from Cloudflare:", err)
    })
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const reordered = [...value]
    const dragged = reordered[draggedIndex]
    reordered.splice(draggedIndex, 1)
    reordered.splice(index, 0, dragged)

    onChange(reordered.map((img, idx) => ({ ...img, sort_order: idx })))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/30">Media</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/50 hover:bg-white/[0.07] hover:text-white/85 transition-all disabled:opacity-40"
        >
          <Upload size={11} />
          {uploading ? "Uploading..." : "Add Images"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {value.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-8 cursor-pointer hover:border-white/25 transition-colors"
        >
          <Upload className="text-white/20" size={22} strokeWidth={1.5} />
          <p className="font-sans text-[10px] uppercase tracking-widest text-white/25">
            Drag and drop, or click to upload
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {value
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="relative group aspect-square rounded-xl overflow-hidden border border-white/8 bg-white/[0.03] cursor-move"
              >
                <Image
                  src={buildCfUrl(item.cf_image_id, "grid")}
                  alt="Review media"
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500/90 text-white p-1.5 rounded-lg transition-opacity hover:bg-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="absolute top-1 right-1 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={13} />
                </div>
              </div>
            ))}
        </div>
      )}

      {error && <p className="mt-2 font-sans text-[10px] text-red-400">{error}</p>}
      <p className="mt-2.5 font-sans text-[9px] tracking-wide text-white/20">
        Drag to reorder. Served from Cloudflare Images.
      </p>
    </div>
  )
}
