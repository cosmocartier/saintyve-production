"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface FilterSortProps {
  // Sort options
  sortValue: string
  onSortChange: (value: string) => void

  // Filter data
  subcategories?: string[]
  brands?: string[]
  colors?: string[]
  styleTypes?: string[]

  // Selected filters
  selectedSubcategories?: string[]
  selectedBrands?: string[]
  selectedColors?: string[]
  selectedStyleTypes?: string[]

  // Filter change handlers
  onSubcategoryChange?: (values: string[]) => void
  onBrandChange?: (values: string[]) => void
  onColorChange?: (values: string[]) => void
  onStyleTypeChange?: (values: string[]) => void

  // Reset handler
  onReset?: () => void

  // Product count
  productCount?: number
  
  // Apply filters callback
  onApply?: () => void
}

export function FilterSort({
  sortValue,
  onSortChange,
  subcategories = [],
  brands = [],
  colors = [],
  styleTypes = [],
  selectedSubcategories = [],
  selectedBrands = [],
  selectedColors = [],
  selectedStyleTypes = [],
  onSubcategoryChange,
  onBrandChange,
  onColorChange,
  onStyleTypeChange,
  onReset,
  productCount = 0,
  onApply,
}: FilterSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([])

  // Debug log filter options
  console.log("[v0] FilterSort received filterOptions:", {
    subcategories,
    brands,
    colors,
    styleTypes,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const handleCheckboxChange = (value: string, currentValues: string[], onChange?: (values: string[]) => void) => {
    if (!onChange) return
    
    if (currentValues.includes(value)) {
      onChange(currentValues.filter((v) => v !== value))
    } else {
      onChange([...currentValues, value])
    }
  }

  const handleReset = () => {
    onSubcategoryChange?.([])
    onBrandChange?.([])
    onColorChange?.([])
    onStyleTypeChange?.([])
    onSortChange("recommended")
    onReset?.()
  }

  const hasActiveFilters =
    selectedSubcategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedStyleTypes.length > 0 ||
    sortValue !== "recommended"

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[12px] font-normal tracking-[0.01em] text-[#111] hover:opacity-60 transition-opacity duration-[160ms]"
      >
        <img
          src="/images/design-mode/Filter-sort.png"
          alt="Filter & Sort"
          className="w-3 h-3"
        />
        <span>Filter & Sort</span>
      </button>

      {/* Filter Panel Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-none p-0 flex flex-col bg-white"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-gray-200">
            <SheetTitle className="text-[17px] font-medium tracking-[0.01em] text-[#111]">
              Filter & sort
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4">
            {/* SORT BY Section */}
            <div className="py-6 border-b border-gray-200">
              <h3 className="text-[15px] tracking-[0.05em] uppercase text-[#111] mb-4 font-medium">
                SORT BY
              </h3>
              <RadioGroup value={sortValue} onValueChange={onSortChange} className="space-y-0">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <RadioGroupItem value="recommended" />
                    <span className="text-[15px] text-[#111]">Recommended</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <RadioGroupItem value="newest" />
                    <span className="text-[15px] text-[#111]">Newest</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <RadioGroupItem value="price-low" />
                    <span className="text-[15px] text-[#111]">Lowest Price</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <RadioGroupItem value="price-high" />
                    <span className="text-[15px] text-[#111]">Highest Price</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Product Type Section */}
            {subcategories.length > 0 && (
              <Collapsible
                open={openSections.includes("product-type")}
                onOpenChange={() => toggleSection("product-type")}
                className="border-b border-gray-200"
              >
                <CollapsibleTrigger className="w-full py-6 flex items-center justify-between text-[15px] font-semibold tracking-[0.05em] uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <span className="font-medium">PRODUCT TYPE</span>
                  <Plus
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      openSections.includes("product-type") && "rotate-45"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-6 space-y-3">
                  {subcategories.map((subcategory) => (
                    <label key={subcategory} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(subcategory)}
                        onChange={() =>
                          handleCheckboxChange(subcategory, selectedSubcategories, onSubcategoryChange)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0 accent-black"
                        style={{ accentColor: 'black' }}
                      />
                      <span className="text-[15px] text-[#111]">{subcategory}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Brands Section */}
            {brands.length > 0 && (
              <Collapsible
                open={openSections.includes("brands")}
                onOpenChange={() => toggleSection("brands")}
                className="border-b border-gray-200"
              >
                <CollapsibleTrigger className="w-full py-6 flex items-center justify-between text-[15px] font-semibold tracking-[0.05em] uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <span className="font-medium">BRANDS</span>
                  <Plus
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      openSections.includes("brands") && "rotate-45"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-6 space-y-3">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleCheckboxChange(brand, selectedBrands, onBrandChange)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0 accent-black"
                        style={{ accentColor: 'black' }}
                      />
                      <span className="text-[15px] text-[#111]">{brand}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Color Filter Section */}
            {colors.length > 0 && (
              <Collapsible
                open={openSections.includes("color")}
                onOpenChange={() => toggleSection("color")}
                className="border-b border-gray-200"
              >
                <CollapsibleTrigger className="w-full py-6 flex items-center justify-between text-[15px] font-semibold tracking-[0.05em] uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <span className="font-medium">COLOR FILTER</span>
                  <Plus
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      openSections.includes("color") && "rotate-45"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-6 space-y-3">
                  {colors.map((color) => (
                    <label key={color} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => handleCheckboxChange(color, selectedColors, onColorChange)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0 accent-black"
                        style={{ accentColor: 'black' }}
                      />
                      <span className="text-[15px] text-[#111]">{color}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Style Type Section */}
            {styleTypes.length > 0 && (
              <Collapsible
                open={openSections.includes("style-type")}
                onOpenChange={() => toggleSection("style-type")}
                className="border-b border-gray-200"
              >
                <CollapsibleTrigger className="w-full py-6 flex items-center justify-between text-[15px] font-semibold tracking-[0.05em] uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <span className="font-medium">STYLE TYPE</span>
                  <Plus
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      openSections.includes("style-type") && "rotate-45"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-6 space-y-3">
                  {styleTypes.map((styleType) => (
                    <label key={styleType} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStyleTypes.includes(styleType)}
                        onChange={() => handleCheckboxChange(styleType, selectedStyleTypes, onStyleTypeChange)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0 accent-black"
                        style={{ accentColor: 'black' }}
                      />
                      <span className="text-[15px] text-[#111]">{styleType}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 flex items-center bg-white">
            <button
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className="flex-1 py-3.5 text-[15px] font-medium text-[#111] border-r border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              RESET
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                onApply?.()
              }}
              className="flex-[2] py-3.5 text-[15px] font-medium text-white bg-black hover:bg-zinc-900 transition-colors"
            >
              VIEW {productCount} PRODUCTS
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
