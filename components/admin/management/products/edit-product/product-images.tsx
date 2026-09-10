"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, GripVertical, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"

interface CloudflareImage {
  id: string
  product_id: string
  cf_image_id: string
  role: "primary" | "hover" | "gallery"
  sort_order: number
  alt_text: string | null
  created_at: string
}

interface CloudflareImagesSectionProps {
  productId: string
  initialImages: CloudflareImage[]
  onUpdate: () => void
}

export function CloudflareImagesSection({ productId, initialImages, onUpdate }: CloudflareImagesSectionProps) {
  const [images, setImages] = useState<CloudflareImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingImageAlt, setEditingImageAlt] = useState<string | null>(null)
  const [tempAltText, setTempAltText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })
      formData.append("role", "gallery")

      const response = await fetch(`/api/admin/products/${productId}/cf-images`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { images: newImages } = await response.json()
      setImages([...images, ...newImages])
      onUpdate()
    } catch (error) {
      console.error("[CF Images] Upload error:", error)
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}/cf-images/${imageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setImages(images.filter((img) => img.id !== imageId))
      onUpdate()
    } catch (error) {
      console.error("[CF Images] Delete error:", error)
      alert("Failed to delete image")
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      sort_order: idx,
    }))

    setImages(reorderedImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      // Use the dedicated reorder endpoint to update all images atomically
      const imageIds = images.map((img) => img.id)
      
      const response = await fetch(`/api/admin/products/${productId}/cf-images/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder images")
      }

      onUpdate()
    } catch (error) {
      console.error("[CF Images] Reorder error:", error)
      alert("Failed to save new image order")
    }

    setDraggedIndex(null)
  }

  const handleUpdateImageAlt = async (imageId: string) => {
    try {
      await fetch(`/api/admin/products/${productId}/cf-images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: tempAltText || null }),
      })

      setImages(images.map((img) => (img.id === imageId ? { ...img, alt_text: tempAltText || null } : img)))
      setEditingImageAlt(null)
      onUpdate()
    } catch (error) {
      console.error("[CF Images] Alt text update error:", error)
      alert("Failed to update alt text")
    }
  }

  return (
    <div className="border border-zinc-200 rounded-md p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium tracking-wide uppercase text-zinc-900">CLOUDFLARE IMAGES (V2)</h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-black rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors hover:bg-black hover:text-white disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Add Images"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-300 rounded-md py-8 text-center">
          <Upload className="mx-auto mb-3 text-zinc-400" size={32} />
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
            No Cloudflare images yet. Click "Add Images" to upload.
          </p>
        </div>
      ) : (
        <div className="max-h-[480px] overflow-y-auto pr-2">
          <div className="grid grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="border border-zinc-200 rounded-md bg-white cursor-move hover:border-black transition-colors"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={buildCfUrl(image.cf_image_id, "grid") || "/placeholder.svg"}
                      alt={image.alt_text || `Product image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-md">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1.5 rounded-md transition-opacity hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="absolute top-1.5 left-1.5 bg-black text-white px-1.5 py-0.5 text-xs font-medium rounded">
                      {index + 1}
                    </div>
                    <div className="absolute top-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-1.5">
                  {editingImageAlt === image.id ? (
                    <div className="space-y-1.5 p-2 border border-zinc-200 rounded-md bg-zinc-50">
                      <textarea
                        placeholder="Add descriptive alt text for SEO"
                        value={tempAltText}
                        onChange={(e) => setTempAltText(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-zinc-300 rounded-md resize-none"
                        rows={3}
                      />
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleUpdateImageAlt(image.id)}
                          className="flex-1 h-6 text-xs bg-black hover:bg-zinc-800 rounded-md"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingImageAlt(null)}
                          className="flex-1 h-6 text-xs border-zinc-300 rounded-md"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingImageAlt(image.id)
                        setTempAltText(image.alt_text || "")
                      }}
                      className="w-full text-left text-[10px] text-zinc-600 hover:text-black transition-colors px-1.5 py-1 rounded hover:bg-zinc-50"
                    >
                      {image.alt_text ? (
                        <span className="line-clamp-2">{image.alt_text}</span>
                      ) : (
                        <span className="italic text-zinc-400">Add Alt Text (SEO)</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 text-xs font-medium text-zinc-500">
        Drag and drop images to reorder. Images served from Cloudflare CDN with optimized variants.
      </p>
    </div>
  )
}
