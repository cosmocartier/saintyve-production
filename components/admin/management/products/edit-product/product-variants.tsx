"use client"

import { useState } from "react"
import { Plus, Trash2, Wand2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductVariant {
  id: string
  sku: string
  size: string | null
  color: string | null
  stock_quantity: number
  price_adjustment: number | null
}

interface ColorInfo {
  name: string
  hex: string
}

interface ProductVariantsProps {
  variants: ProductVariant[]
  availableColors: ColorInfo[]
  productSlug: string
  onAddVariant: () => void
  onUpdateVariant: (index: number, field: string, value: any) => void
  onDeleteVariant: (index: number, variantId: string) => void
  onGenerateVariants: (config: {
    productType: "jacket" | "shoes" | "belts" | "accessories" | "custom"
    includeColors: boolean
    customSizes: string
    availableColors: ColorInfo[]
  }) => void
}

export function ProductVariants({
  variants,
  availableColors,
  productSlug,
  onAddVariant,
  onUpdateVariant,
  onDeleteVariant,
  onGenerateVariants,
}: ProductVariantsProps) {
  const [showVariantGenerator, setShowVariantGenerator] = useState(false)
  const [productType, setProductType] = useState<"jacket" | "shoes" | "belts" | "accessories" | "custom">("jacket")
  const [includeColors, setIncludeColors] = useState(true)
  const [customSizes, setCustomSizes] = useState<string>("")

  const handleGenerateVariants = () => {
    onGenerateVariants({
      productType,
      includeColors,
      customSizes,
      availableColors,
    })
    setShowVariantGenerator(false)
  }

  const getPreviewCount = () => {
    if (productType === "custom" && !customSizes.trim()) {
      return 0
    }

    const sizeCount =
      productType === "jacket"
        ? 7
        : productType === "shoes"
          ? 11
          : productType === "belts"
            ? 7
            : productType === "accessories"
              ? 1
              : customSizes.split(",").filter(Boolean).length

    const colorCount = includeColors && availableColors.length > 0 ? availableColors.length : 1

    return sizeCount * colorCount
  }

  return (
    <>
      <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">Product Variants</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowVariantGenerator(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all"
            >
              <Wand2 size={12} />
              Generate Variants
            </button>
            <button
              type="button"
              onClick={onAddVariant}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all"
            >
              <Plus size={12} />
              Add Manually
            </button>
          </div>
        </div>

        {availableColors.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-white/8 bg-white/[0.02]">
            <p className="font-sans text-[9px] font-medium tracking-[0.14em] uppercase text-white/40 mb-2">Available Colors from Images:</p>
            <div className="flex gap-2 flex-wrap">
              {availableColors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03]"
                >
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                  <span className="font-sans text-[9px] font-medium text-white/60">{color.name}</span>
                </div>
              ))}
            </div>
            <p className="font-sans text-[9px] text-white/25 mt-2">
              Use "Generate Variants" to auto-create size x color combinations
            </p>
          </div>
        )}

        {variants.length > 0 && (
          <div className="grid grid-cols-6 gap-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/8 mb-2">
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">SKU</div>
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Color</div>
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Size</div>
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 text-right">Stock</div>
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 text-right">Price Adj.</div>
            <div className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Actions</div>
          </div>
        )}

        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-3 grid grid-cols-6 gap-4 items-center"
              >
                <div>
                  <input
                    type="text"
                    value={variant.sku || ""}
                    onChange={(e) => onUpdateVariant(index, "sku", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-white/70 placeholder-white/20 focus:border-white/25 focus:outline-none transition-all"
                    placeholder="PROD-001-BLK"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={variant.color || ""}
                    onChange={(e) => onUpdateVariant(index, "color", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-white/70 placeholder-white/20 focus:border-white/25 focus:outline-none transition-all"
                    placeholder="Color"
                    list={`color-suggestions-${index}`}
                  />
                  <datalist id={`color-suggestions-${index}`}>
                    {availableColors.map((color) => (
                      <option key={color.name} value={color.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <input
                    type="text"
                    value={variant.size || ""}
                    onChange={(e) => onUpdateVariant(index, "size", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-white/70 placeholder-white/20 focus:border-white/25 focus:outline-none transition-all"
                    placeholder="Size"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    value={variant.stock_quantity}
                    onChange={(e) => onUpdateVariant(index, "stock_quantity", Number.parseInt(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-right text-white/70 focus:border-white/25 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price_adjustment || 0}
                    onChange={(e) => onUpdateVariant(index, "price_adjustment", Number.parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-right text-white/70 focus:border-white/25 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onDeleteVariant(index, variant.id)}
                    className="w-full rounded-lg border border-red-500/30 text-red-400 px-2 py-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.12em] hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={11} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {variants.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
            <Wand2 className="mx-auto mb-3 text-white/20" size={28} />
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/35 mb-1">No variants yet</p>
            <p className="font-sans text-[9px] text-white/25">
              Click "Generate Variants" for automated size x color combinations
            </p>
          </div>
        )}
      </div>

      <Dialog open={showVariantGenerator} onOpenChange={setShowVariantGenerator}>
        <DialogContent className="sm:max-w-md bg-[#131313] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-[13px] font-light uppercase tracking-[0.12em] text-white/90">Generate Product Variants</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Product Type Selection */}
            <div>
              <label className="block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-3">Product Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["jacket", "shoes", "belts", "accessories", "custom"] as const).map((type) => {
                  const labels: Record<string, { title: string; sub: string }> = {
                    jacket: { title: "Jacket / Clothing", sub: "XS, S, M, L, XL, 2XL, 3XL" },
                    shoes: { title: "Shoes", sub: "36 - 46" },
                    belts: { title: "Belt Sizes", sub: "80, 85, 90, 95, 100, 105, 110" },
                    accessories: { title: "Accessories", sub: "ONE SIZE" },
                    custom: { title: "Custom Sizes", sub: "Define your own" },
                  }
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProductType(type)}
                      className={`rounded-xl p-3.5 text-center transition-all border ${
                        productType === type
                          ? "border-white/30 bg-white/[0.08] text-white"
                          : "border-white/8 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white/70"
                      }`}
                    >
                      <div className="font-sans text-[10px] font-medium uppercase tracking-[0.12em]">{labels[type].title}</div>
                      <p className="font-sans text-[9px] mt-1 opacity-60">{labels[type].sub}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Sizes Input */}
            {productType === "custom" && (
              <div>
                <label className="block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-2">
                  Custom Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={customSizes}
                  onChange={(e) => setCustomSizes(e.target.value)}
                  placeholder="e.g., 28, 30, 32, 34, 36"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/80 placeholder-white/20 focus:border-white/25 focus:outline-none transition-all"
                />
                <p className="font-sans text-[9px] text-white/25 mt-2">
                  Enter sizes separated by commas. Example: XS, S, M or 28, 30, 32
                </p>
              </div>
            )}

            {/* Color Selection */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeColors}
                  onChange={(e) => setIncludeColors(e.target.checked)}
                  disabled={availableColors.length === 0}
                  className="w-4 h-4 cursor-pointer accent-white rounded disabled:opacity-40"
                />
                <div>
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">Include Color Variations</span>
                  <p className="font-sans text-[9px] text-white/30 mt-1">
                    {availableColors.length > 0
                      ? `Create variants for each of the ${availableColors.length} colors assigned to images`
                      : "No colors assigned to images yet. Assign colors to images first."}
                  </p>
                </div>
              </label>

              {includeColors && availableColors.length > 0 && (
                <div className="mt-3 p-3 rounded-xl border border-white/8 bg-white/[0.02]">
                  <p className="font-sans text-[9px] text-white/40 mb-2">Colors to include:</p>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03]"
                      >
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                        <span className="font-sans text-[9px] text-white/60">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
              <p className="font-sans text-[9px] text-white/40 mb-2">Preview:</p>
              <p className="font-sans text-[11px] text-white/70">
                {productType === "custom" && !customSizes.trim()
                  ? "Enter custom sizes to see preview"
                  : `This will generate ${getPreviewCount()} unique variants with SKUs`}
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGenerateVariants}
                disabled={productType === "custom" && !customSizes.trim()}
                className="flex-1 rounded-xl bg-white/90 text-black px-6 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-all hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Variants
              </button>
              <button
                type="button"
                onClick={() => setShowVariantGenerator(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 hover:bg-white/[0.07] hover:text-white/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
