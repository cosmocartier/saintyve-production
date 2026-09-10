"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface AiTryOnSectionProps {
  tryonImages: Array<{ id: string; image_url: string }>
  isUploadingImage: boolean
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDeleteImage: (imageId: string, imageUrl: string) => void
}

export default function AiTryOnSection({
  tryonImages,
  isUploadingImage,
  handleImageUpload,
  handleDeleteImage,
}: AiTryOnSectionProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900 mb-8">AI TRY-ON</h2>

        <div className="space-y-6">
          <div className="text-center py-8 border-2 border-dashed border-zinc-200 hover:border-zinc-300 transition-colors">
            <input
              type="file"
              id="tryon-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploadingImage}
            />
            <label htmlFor="tryon-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
              <p className="text-sm font-medium mb-2">{isUploadingImage ? "Uploading..." : "Upload Your Photo"}</p>
              <p className="text-xs text-zinc-500 mb-4">Upload a photo to see how our products look on you</p>
              <Button
                type="button"
                disabled={isUploadingImage}
                className="bg-black text-white hover:bg-zinc-800 rounded-full text-xs font-medium tracking-widest uppercase h-12 px-8"
              >
                {isUploadingImage ? "UPLOADING..." : "SELECT PHOTO"}
              </Button>
            </label>
          </div>

          {tryonImages.length > 0 && (
            <div>
              <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-900 mb-4">YOUR PHOTOS</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tryonImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url || "/placeholder.svg"}
                      alt="Try-on photo"
                      className="w-full h-48 object-cover border border-black/10"
                    />
                    <button
                      onClick={() => handleDeleteImage(image.id, image.image_url)}
                      className="absolute top-2 right-2 p-2 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
