"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { generateProductSlug, generateDisplayTitle } from "@/lib/utils/slug-generator"

const CATEGORIES = ["Accessories", "Bags", "Outerwear", "Clothing", "Shoes"] as const

const SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  Men: {
    Accessories: ["Belt", "Cardholder", "Hat & Cap", "Jewelry", "Scarves", "Sunglasses", "Tech-Accessory"],
    Bags: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Vest", "Windbreaker"],
    Clothing: ["Shirt", "T-Shirt", "Jeans", "Pants", "Shorts"],
    Shoes: ["Boots", "Dress Shoes", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Women: {
    Accessories: ["Belt", "Hair Accessor", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory"],
    Bags: ["Crossbody Bag", "Mini Bag", "Shoulder Bag", "Top Handle Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat"],
    Clothing: ["Pants", "Jeans", "Dress", "Shirt", "T-Shirt", "Shorts"],
    Shoes: ["Boots", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Unisex: {
    Accessories: ["Belt", "Cardholder", "Hair Accessory", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory"],
    Bags: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Mini Bag", "Shoulder Bag", "Tote Bag", "Travel Bag", "Top Handle Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat", "Vest", "Windbreaker"],
    Clothing: ["T-Shirt", "Shirt", "Dress", "Jeans", "Pants", "Shorts"],
    Shoes: ["Boots", "Dress Shoes", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
}

const MAIN_CATEGORIES = ["Men", "Women", "Unisex"] as const

export default function NewProductForm({ preselectedCategoryId }: { preselectedCategoryId?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    name: "",
    description: "",
    price: 0,
    category: "",
    sub_category: "",
    category_id: preselectedCategoryId || "",
    slug: "",
    status: "draft" as "draft" | "live",
    parent_product_name: "",
    gender: "",
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBrandModelColorChange = (field: "brand" | "model" | "color", value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Auto-generate slug if not manually edited
    if (!slugManuallyEdited && newFormData.brand && newFormData.model && newFormData.color) {
      const newSlug = generateProductSlug(newFormData.brand, newFormData.model, newFormData.color)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }

    // Update display name
    if (newFormData.brand && newFormData.model && newFormData.color) {
      const displayName = generateDisplayTitle(newFormData.brand, newFormData.model, newFormData.color)
      setFormData((prev) => ({ ...prev, name: displayName }))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      console.log("[v0] Creating new product:", formData.name)

      // Validate required fields
      if (!formData.brand?.trim() || !formData.model?.trim() || !formData.color?.trim()) {
        throw new Error("Brand, Model, and Color are required fields")
      }
      if (!formData.name.trim()) {
        throw new Error("Product name is required")
      }
      if (formData.price <= 0) {
        throw new Error("Price must be greater than 0")
      }
      if (!formData.slug.trim()) {
        throw new Error("Slug is required")
      }
      if (!formData.gender) {
        throw new Error("Gender is required")
      }
      if (!formData.category) {
        throw new Error("Category is required")
      }
      if (!CATEGORIES.includes(formData.category as any)) {
        throw new Error("Invalid category selected")
      }

      // Create the product
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          color: formData.color.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: formData.price,
          category: formData.category.trim(),
          sub_category: formData.sub_category.trim() || null,
          category_id: formData.category_id || null,
          slug: formData.slug.trim(),
          status: formData.status,
          parent_product_name: formData.parent_product_name.trim() || null,
          gender: formData.gender.trim() || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] ❌ Product creation error:", insertError.message)
        throw new Error(`Failed to create product: ${insertError.message}`)
      }

      if (!newProduct || !newProduct.id) {
        throw new Error("Product created but no ID returned")
      }

      console.log("[v0] ✓ Product created successfully:", newProduct.id)

      if (preselectedCategoryId) {
        router.push(`/admin/products?category=${preselectedCategoryId}`)
      } else {
        // Redirect to edit page to add images and variants
        router.push(`/admin/products/${newProduct.id}/edit`)
      }
      router.refresh()
    } catch (err) {
      console.error("[v0] ❌ Submit error:", err)
      setError(err instanceof Error ? err.message : "Failed to create product")
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-xl bg-white/[0.03] border border-white/8 px-4 py-2.5 font-sans text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
  const labelClass = "block font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/35 mb-2"
  const hintClass = "mt-1.5 font-sans text-[10px] text-white/20"

  return (
    <form onSubmit={handleSubmit} className="pb-28 max-w-3xl">
      {/* Product Details Section */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
        <h2 className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-white/35 mb-7">Product Details</h2>

        <div className="space-y-5">
          {/* Brand, Model, Color */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Brand *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleBrandModelColorChange("brand", e.target.value)}
                className={inputClass}
                placeholder="Jordan"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Model *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleBrandModelColorChange("model", e.target.value)}
                className={inputClass}
                placeholder="1 Low"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Color *</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleBrandModelColorChange("color", e.target.value)}
                className={inputClass}
                placeholder="Travis Scott Velvet Brown"
                required
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className={labelClass}>Product Name (Auto-generated) *</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className="w-full rounded-xl bg-white/[0.02] border border-white/6 px-4 py-2.5 font-sans text-[11px] text-white/25 cursor-not-allowed"
              placeholder="Will be generated from Brand + Model + Color"
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug (Auto-generated) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={`${inputClass} font-mono`}
              placeholder="Will be generated from Brand + Model + Color"
              required
            />
            <p className={hintClass}>Used in the product URL. Auto-generated but you can edit manually if needed.</p>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Price (EUR) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              className={inputClass}
              placeholder="99.99"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value, category: "", sub_category: "" })}
              className={inputClass}
              required
            >
              <option value="">Select gender...</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, sub_category: "" })}
              className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              required
              disabled={!formData.gender}
            >
              <option value="">{formData.gender ? "Select a category..." : "Select gender first..."}</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {!formData.gender && (
              <p className="mt-1.5 font-sans text-[10px] text-amber-400/70">Please select a gender first</p>
            )}
          </div>

          {/* Sub-Category */}
          <div>
            <label className={labelClass}>Sub-Category</label>
            <select
              value={formData.sub_category}
              onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
              className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              disabled={!formData.gender || !formData.category}
            >
              <option value="">
                {!formData.gender ? "Select gender first..." : !formData.category ? "Select category first..." : "Select a sub-category..."}
              </option>
              {formData.gender && formData.category &&
                SUBCATEGORIES[formData.gender]?.[formData.category]?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
            </select>
            {(!formData.gender || !formData.category) && (
              <p className="mt-1.5 font-sans text-[10px] text-amber-400/70">
                {!formData.gender ? "Please select a gender first" : "Please select a category first"}
              </p>
            )}
          </div>

          {/* Parent Product Name */}
          <div>
            <label className={labelClass}>Parent Product Name (Optional)</label>
            <input
              type="text"
              value={formData.parent_product_name}
              onChange={(e) => setFormData({ ...formData, parent_product_name: e.target.value })}
              className={inputClass}
              placeholder="e.g., Nike Air Max 270"
            />
            <p className={hintClass}>Enter the same name for all color variants to group them together on product pages</p>
          </div>

          {/* Initial Status */}
          <div>
            <label className={labelClass}>Initial Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "draft" })}
                className={`flex-1 rounded-xl px-4 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] border transition-all ${
                  formData.status === "draft"
                    ? "border-white/15 bg-white/[0.06] text-white/80"
                    : "border-white/6 bg-transparent text-white/25 hover:bg-white/[0.03] hover:text-white/50"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "live" })}
                className={`flex-1 rounded-xl px-4 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] border transition-all ${
                  formData.status === "live"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/6 bg-transparent text-white/25 hover:bg-white/[0.03] hover:text-white/50"
                }`}
              >
                Live
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 mt-5">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-red-400 mb-1">Error</p>
          <p className="font-sans text-[11px] text-red-400/70">{error}</p>
        </div>
      )}

      {/* Action Buttons — sticky footer */}
      <div className="fixed bottom-0 left-64 right-0 bg-[#0e0e0e] border-t border-white/6 py-4 px-8 flex justify-between items-center z-10">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
          className="rounded-xl border border-white/8 bg-white/[0.03] px-6 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-all disabled:opacity-30"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/70 hover:bg-white/[0.09] hover:text-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  )
}
