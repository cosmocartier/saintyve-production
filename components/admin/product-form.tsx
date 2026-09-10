"use client"

import type React from "react"

import { useState } from "react"
import type { ProductWithVariants } from "@/lib/types/product"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "./image-upload"
import { X } from "lucide-react"

interface ProductFormProps {
  product: ProductWithVariants | null
  onClose: () => void
  onSave: (product: ProductWithVariants) => void
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    image: product?.image || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (product) {
        // Update existing product
        const { data, error } = await supabase.from("products").update(formData).eq("id", product.id).select().single()

        if (error) throw error
        onSave(data as ProductWithVariants)
      } else {
        // Create new product
        const { data, error } = await supabase.from("products").insert([formData]).select().single()

        if (error) throw error
        onSave(data as ProductWithVariants)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setFormData({ ...formData, image: url })
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    })
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white p-8">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold uppercase tracking-widest">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-black">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Product Image</label>
            <ImageUpload currentImage={formData.image} onImageUploaded={handleImageUploaded} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-widest">Main Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
                required
              >
                <option value="">Select category</option>
                <option value="Sneaker">Sneaker</option>
                <option value="Jacket">Jacket</option>
                <option value="Vest">Vest</option>
                <option value="Bag">Bag</option>
                <option value="Watch">Watch</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
          </div>

          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-black px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
