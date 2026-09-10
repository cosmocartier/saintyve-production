"use client"

import type React from "react"
import { generateDisplayTitle } from "@/lib/utils/slug-generator"

interface ProductIdentityProps {
  formData: {
    brand: string
    model: string
    color: string
    name: string
    slug: string
    parent_product_name: string | null
    meta_title: string | null
    meta_description: string | null
    price: number
    discounted_price: number | null
    retail_price: number | null
  }
  slugManuallyEdited: boolean
  onBrandModelColorChange: (field: "brand" | "model" | "color", value: string) => void
  onNameChange: (name: string) => void
  onSlugChange: (value: string) => void
  onResetSlug: () => void
  onInputChange: (field: string, value: any) => void
}

export function ProductIdentity({
  formData,
  slugManuallyEdited,
  onBrandModelColorChange,
  onNameChange,
  onSlugChange,
  onResetSlug,
  onInputChange,
}: ProductIdentityProps) {
  const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/80 placeholder-white/20 focus:border-white/25 focus:outline-none focus:bg-white/[0.06] transition-all"
  const labelCls = "block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-2"

  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-5">Product Identity</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Brand *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => onBrandModelColorChange("brand", e.target.value)}
              className={inputCls}
              placeholder="Jordan"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => onBrandModelColorChange("model", e.target.value)}
              className={inputCls}
              placeholder="1 Low"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Color *</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => onBrandModelColorChange("color", e.target.value)}
              className={inputCls}
              placeholder="Travis Scott Velvet Brown"
              required
            />
          </div>
        </div>

        {formData.brand && formData.model && formData.color && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <label className={labelCls}>Full Display Title (Preview)</label>
            <p className="text-[12px] font-medium text-white/80">
              {generateDisplayTitle(formData.brand, formData.model, formData.color)}
            </p>
          </div>
        )}

        <div>
          <label className={labelCls}>Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onNameChange(e.target.value)}
            className={inputCls}
            required
          />
          <p className="mt-2 font-sans text-[9px] text-white/25">
            The slug will be auto-generated from the product name
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls} style={{ marginBottom: 0 }}>Product Slug (URL)</label>
            {slugManuallyEdited && (
              <button
                type="button"
                onClick={onResetSlug}
                className="font-sans text-[9px] font-medium tracking-[0.16em] uppercase text-white/40 hover:text-white/70 transition-colors"
              >
                Reset to Auto
              </button>
            )}
          </div>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className={`${inputCls} mt-2`}
            required
          />
          <p className="mt-2 font-sans text-[9px] text-white/25">
            {slugManuallyEdited
              ? "Slug manually edited. Changes to brand/model/color won't update it. Click 'Reset to Auto' to re-enable."
              : "Auto-generated from brand, model, and color. Edit manually if needed."}
          </p>
        </div>

        <div>
          <label className={labelCls}>Parent Product Name (Optional)</label>
          <input
            type="text"
            value={formData.parent_product_name || ""}
            onChange={(e) => onInputChange("parent_product_name", e.target.value)}
            placeholder="e.g., Nike Air Max 270"
            className={inputCls}
          />
          <p className="mt-2 font-sans text-[9px] text-white/25">
            Enter the same name for all color variants to group them together on product pages
          </p>
        </div>

        <div>
          <label className={labelCls}>Meta Title (SEO)</label>
          <input
            type="text"
            value={formData.meta_title || ""}
            onChange={(e) => onInputChange("meta_title", e.target.value)}
            className={inputCls}
            placeholder="Balenciaga Speed 2.0 Black Sole – Premium Quality Sneakers | DESIGNERDRIP"
            maxLength={70}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="font-sans text-[9px] text-white/25">
              Used for the browser tab and Google search results. Keep it around 60–70 characters.
            </p>
            <span className={`font-sans text-[9px] font-medium ${(formData.meta_title?.length || 0) > 70 ? "text-red-400" : "text-white/25"}`}>
              {formData.meta_title?.length || 0}/70
            </span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Meta Description (SEO)</label>
          <textarea
            value={formData.meta_description || ""}
            onChange={(e) => onInputChange("meta_description", e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Discover the Balenciaga Speed 2.0 in Black Sole. Premium materials, AA+ craftsmanship, perfect details, fast worldwide shipping."
            rows={3}
            maxLength={160}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="font-sans text-[9px] text-white/25">Shown on Google search results. Aim for ~150–160 characters.</p>
            <span className={`font-sans text-[9px] font-medium ${(formData.meta_description?.length || 0) > 160 ? "text-red-400" : "text-white/25"}`}>
              {formData.meta_description?.length || 0}/160
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (EUR)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onInputChange("price", Number.parseFloat(e.target.value))}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Discounted Price (EUR)</label>
            <input
              type="number"
              step="0.01"
              value={formData.discounted_price ?? ""}
              onChange={(e) =>
                onInputChange("discounted_price", e.target.value ? Number.parseFloat(e.target.value) : null)
              }
              className={inputCls}
              placeholder="Discounted Price"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Retail Price (EUR)</label>
            <input
              type="number"
              step="0.01"
              value={formData.retail_price ?? ""}
              onChange={(e) =>
                onInputChange("retail_price", e.target.value ? Number.parseFloat(e.target.value) : null)
              }
              className={inputCls}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
