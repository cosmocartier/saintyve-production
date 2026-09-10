"use client"

import { Sparkles } from "lucide-react"
import { RichTextEditor } from "@/components/admin/management/products/edit-product/rich-text-editor"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"

interface ProductDescriptionProps {
  formData: Product
  aiDescriptionGenerating: boolean
  isGeneratingSizeFit: boolean
  onInputChange: (field: string, value: any) => void
  onGenerateDescription: () => void
  onGenerateSizeFit: () => void
}

export function ProductDescription({
  formData,
  aiDescriptionGenerating,
  isGeneratingSizeFit,
  onInputChange,
  onGenerateDescription,
  onGenerateSizeFit,
}: ProductDescriptionProps) {
  const labelCls = "block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-2"

  return (
    <>
      {/* Description Section */}
      <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls} style={{ marginBottom: 0 }}>Description</label>
          <button
            type="button"
            onClick={onGenerateDescription}
            disabled={
              aiDescriptionGenerating ||
              !formData.brand ||
              !formData.model ||
              !formData.color ||
              !formData.category
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 hover:bg-white/[0.07] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Generate first paragraph with AI (requires brand, model, color, category)"
          >
            <Sparkles size={12} />
            {aiDescriptionGenerating ? "Generating..." : "Generate Paragraph 1"}
          </button>
        </div>
        <p className="font-sans text-[9px] text-white/25 mb-3">
          AI-generated introduction. Review before publishing.
        </p>
        <RichTextEditor
          content={formData.description}
          onChange={(html) => onInputChange("description", html)}
          placeholder="Short product description (2-3 sentences) that appears above the expandable sections..."
        />
      </div>

      {/* Expandable Product Sections */}
      <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
        <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-2">
          Expandable Product Sections
        </h2>
        <p className="font-sans text-[9px] text-white/25 mb-6">
          These sections appear as collapsible dropdowns on the product page, displayed after the Add to Bag button.
        </p>

        <div className="space-y-6">
          <div>
            <label className={labelCls}>Product Details</label>
            <RichTextEditor
              content={formData.product_details}
              onChange={(html) => onInputChange("product_details", html)}
              placeholder="Detailed product specifications, features, style code, etc..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls} style={{ marginBottom: 0 }}>Size &amp; Fit</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGenerateSizeFit}
                disabled={isGeneratingSizeFit}
                className="h-7 font-sans text-[10px] border-white/10 bg-transparent text-white/50 hover:bg-white/[0.07] hover:text-white/80"
              >
                {isGeneratingSizeFit ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                    Generating...
                  </>
                ) : (
                  <>Generate Size &amp; Fit</>
                )}
              </Button>
            </div>
            <RichTextEditor
              content={formData.size_and_fit}
              onChange={(html) => onInputChange("size_and_fit", html)}
              placeholder="Sizing information, fit details, model measurements, etc..."
            />
            <p className="mt-1 font-sans text-[9px] text-white/25">Generated from product attributes. Review before saving.</p>
          </div>

          <div>
            <label className={labelCls}>Materials &amp; Care</label>
            <RichTextEditor
              content={formData.materials_and_care}
              onChange={(html) => onInputChange("materials_and_care", html)}
              placeholder="Material composition, care instructions, washing guidelines, etc..."
            />
          </div>

          <div>
            <label className={labelCls}>Our Commitment</label>
            <RichTextEditor
              content={formData.our_commitment}
              onChange={(html) => onInputChange("our_commitment", html)}
              placeholder="Sustainability practices, brand values, ethical sourcing, etc..."
            />
          </div>

          <div>
            <label className={labelCls}>SEO Keywords</label>
            <input
              type="text"
              value={formData.seo_keywords}
              onChange={(e) => onInputChange("seo_keywords", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/80 placeholder-white/20 focus:border-white/25 focus:outline-none focus:bg-white/[0.06] transition-all"
              placeholder="e.g., designer jacket, luxury outerwear, premium fashion, winter coat"
            />
            <p className="mt-2 font-sans text-[9px] text-white/25">
              Enter comma-separated keywords to improve search engine ranking. These keywords are not visible to
              customers but help search engines understand and index your product better.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
