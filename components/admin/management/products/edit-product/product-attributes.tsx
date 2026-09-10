"use client"

const CATEGORIES = ["Accessory", "Bag", "Outerwear", "Clothing", "Shoe"] as const

const SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  Men: {
    Accessory: ["Belt", "Cardholder", "Hat & Cap", "Jewelry", "Scarves", "Sunglasses", "Tech-Accessory", "Watch"],
    Bag: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Vest", "Windbreaker"],
    Clothing: ["Shirt", "T-Shirt", "Jeans", "Pants", "Shorts"],
    Shoe: ["Boots", "Dress Shoes", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Women: {
    Accessory: ["Belt", "Hair Accessor", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory", "Watch"],
    Bag: ["Crossbody Bag", "Mini Bag", "Shoulder Bag", "Top Handle Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat", "Down Coat"],
    Clothing: ["Pants", "Jeans", "Dress", "Shirt", "T-Shirt", "Shorts"],
    Shoe: ["Boots", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Unisex: {
    Accessory: ["Belt", "Cardholder", "Hair Accessory", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory", "Watch"],
    Bag: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Mini Bag", "Shoulder Bag", "Tote Bag", "Travel Bag", "Top Handle Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat", "Down Coat", "Vest", "Windbreaker"],
    Clothing: ["T-Shirt", "Shirt", "Dress", "Jeans", "Pants", "Shorts"],
    Shoe: ["Boots", "Dress Shoes", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
}

interface ProductAttributesProps {
  formData: {
    gender: string
    category: string
    sub_category: string
    material: string
    style_type: string
    color_filter: string
    fit_profile: string
    sizing_recommendation: string
    weight_feel: string
    seasonality: string[]
    silhouette: string
    closure_type: string
    lining_type: string
    heel_height_cm: number | null
    dimension_width_cm: number | null
    dimension_height_cm: number | null
    dimension_depth_cm: number | null
    capacity_type: string
    carry_style: string
    size_mm: number | null
    length_cm: number | null
    fastening_type: string
    statement_level: string
    drop_context: string
    replication_accuracy: number | null
  }
  onFormDataChange: (updates: Partial<ProductAttributesProps["formData"]>) => void
  onInputChange: (field: string, value: any) => void
  setHasUnsavedChanges: (value: boolean) => void
}

export function ProductAttributes({
  formData,
  onFormDataChange,
  onInputChange,
  setHasUnsavedChanges,
}: ProductAttributesProps) {
  const inputCls = "w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25 transition-all"
  const selectCls = "w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] text-white/80 focus:outline-none focus:border-white/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  const labelCls = "block font-sans text-[9px] font-medium mb-2 text-white/40"
  const sectionHeadCls = "font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-white/30 border-b border-white/8 pb-2"

  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div className="space-y-6">
        <div>
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 mb-4">Product Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gender Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) => {
                  onFormDataChange({
                    gender: e.target.value,
                    category: "", // Reset category when gender changes
                    sub_category: "", // Reset sub-category when gender changes
                  })
                  setHasUnsavedChanges(true)
                }}
                className={selectCls}
                required
              >
                <option value="">Select gender...</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Main Category Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">
                Main Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category || ""}
                onChange={(e) => {
                  onFormDataChange({
                    category: e.target.value,
                    sub_category: "", // Reset sub-category when category changes
                  })
                  setHasUnsavedChanges(true)
                }}
                className={selectCls}
                required
                disabled={!formData.gender}
              >
                <option value="">
                  {formData.gender ? "Select a category..." : "Select gender first..."}
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {!formData.gender && <p className="font-sans text-[9px] text-amber-400/80 mt-1">Please select a gender first</p>}
            </div>

            {/* Sub-Category Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">Sub-Category</label>
              <select
                value={formData.sub_category || ""}
                onChange={(e) => {
                  onFormDataChange({
                    sub_category: e.target.value,
                  })
                  setHasUnsavedChanges(true)
                }}
                className={selectCls}
                disabled={!formData.gender || !formData.category}
              >
                <option value="">
                  {!formData.gender
                    ? "Select gender first..."
                    : !formData.category
                    ? "Select category first..."
                    : "Select a sub-category..."}
                </option>
                {formData.gender &&
                  formData.category &&
                  SUBCATEGORIES[formData.gender]?.[formData.category]?.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
              </select>
              {(!formData.gender || !formData.category) && (
                <p className="font-sans text-[9px] text-amber-400/80 mt-1">
                  {!formData.gender ? "Please select a gender first" : "Please select a category first"}
                </p>
              )}
            </div>

            {/* Material Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">Material</label>
              <select
                value={formData.material}
                onChange={(e) => onInputChange("material", e.target.value)}
                className={inputCls}
              >
                <option value="">Select Material</option>
                <optgroup label="Apparel, Bags & Sneakers">
                  <option value="Grosgrain">Grosgrain</option>
                  <option value="Lambskin">Lambskin</option>
                  <option value="Calfskin">Calfskin</option>
                  <option value="Nylon">Nylon</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Linen">Linen</option>
                  <option value="Raffia">Raffia</option>
                  <option value="Silk">Silk</option>
                  <option value="Primeknit">Primeknit</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Velvet">Velvet</option>
                  <option value="Rubber">Rubber</option>
                  <option value="Denim">Denim</option>
                  <option value="Wool">Wool</option>
                  <option value="Suede">Suede</option>
                  <option value="Down-Filled">Down-Filled</option>
                  <option value="Synthetic Blend">Synthetic Blend</option>
                </optgroup>
                <optgroup label="Watches & Accessories">
                  <option value="Stainless Steel">Stainless Steel</option>
                  <option value="Gold-Tone Metal">Gold-Tone Metal</option>
                  <option value="Silver-Tone Metal">Silver-Tone Metal</option>
                  <option value="Rose-Gold">Rose-Gold</option>
                </optgroup>
              </select>
            </div>

            {/* Style Type Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">Style Type</label>
              <select
                value={formData.style_type}
                onChange={(e) => onInputChange("style_type", e.target.value)}
                className={inputCls}
              >
                <option value="">Select Style</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Luxury">Luxury</option>
                <option value="Street-Luxury">Street-Luxury</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Minimal">Minimal</option>
                <option value="Sport-Inspired">Sport-Inspired</option>
                <option value="Classic">Classic</option>
                <option value="Statement">Statement</option>
              </select>
            </div>

            {/* Color Filter Dropdown */}
            <div>
              <label className="block font-sans text-[9px] font-medium uppercase tracking-[0.16em] mb-2 text-white/40">Color Filter</label>
              <select
                value={formData.color_filter}
                onChange={(e) => onInputChange("color_filter", e.target.value)}
                className={inputCls}
              >
                <option value="">Select Color</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Grey">Grey</option>
                <option value="Beige">Beige</option>
                <option value="Cream">Cream</option>
                <option value="Brown">Brown</option>
                <option value="Blue">Blue</option>
                <option value="Navy">Navy</option>
                <option value="Light Blue">Light Blue</option>
                <option value="Red">Red</option>
                <option value="Burgundy">Burgundy</option>
                <option value="Pink">Pink</option>
                <option value="Green">Green</option>
                <option value="Olive">Olive</option>
                <option value="Yellow">Yellow</option>
                <option value="Orange">Orange</option>
                <option value="Purple">Purple</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Multicolor">Multicolor</option>
                <option value="Transparent">Transparent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 space-y-6">
          <h3 className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Advanced Attributes</h3>

          {/* Fit & Sizing */}
          <div className="space-y-4">
            <h4 className={sectionHeadCls}>
              Fit & Sizing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Fit Profile</label>
                <select
                  value={formData.fit_profile}
                  onChange={(e) => onInputChange("fit_profile", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Not specified</option>
                  <option value="true_to_size">True to size</option>
                  <option value="slightly_oversized">Slightly oversized</option>
                  <option value="oversized">Oversized</option>
                  <option value="relaxed_fit">Relaxed fit</option>
                  <option value="slim_fit">Slim fit</option>
                  <option value="cropped_fit">Cropped fit</option>
                  <option value="boxy_fit">Boxy fit</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Sizing Recommendation</label>
                <select
                  value={formData.sizing_recommendation}
                  onChange={(e) => onInputChange("sizing_recommendation", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Not specified</option>
                  <option value="take_usual_size">Take usual size</option>
                  <option value="size_up_for_looser_fit">Size up for looser fit</option>
                  <option value="size_down_for_closer_fit">Size down for closer fit</option>
                  <option value="if_between_size_up">If between sizes, size up</option>
                  <option value="if_between_size_down">If between sizes, size down</option>
                </select>
              </div>
            </div>
          </div>

          {/* Build & Feel */}
          <div className="space-y-4">
            <h4 className={sectionHeadCls}>
              Build & Feel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Weight/Feel</label>
                <select
                  value={formData.weight_feel}
                  onChange={(e) => onInputChange("weight_feel", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Not specified</option>
                  <option value="lightweight">Lightweight</option>
                  <option value="midweight">Midweight</option>
                  <option value="heavyweight">Heavyweight</option>
                  <option value="structured">Structured</option>
                  <option value="soft_structured">Soft structured</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Seasonality</label>
                <div className="flex flex-wrap gap-2">
                  {["spring", "summer", "autumn", "winter", "all_season"].map((season) => (
                    <label key={season} className="flex items-center gap-2 font-sans text-[10px] text-white/60">
                      <input
                        type="checkbox"
                        checked={formData.seasonality.includes(season)}
                        onChange={(e) => {
                          const newSeasonality = e.target.checked
                            ? [...formData.seasonality, season]
                            : formData.seasonality.filter((s) => s !== season)
                          onFormDataChange({ seasonality: newSeasonality })
                          setHasUnsavedChanges(true)
                        }}
                        className="w-4 h-4 cursor-pointer accent-white rounded"
                      />
                      <span className="capitalize">{season.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Shape & Construction - Only for Shoe & Outerwear/Clothing categories */}
          {(formData.category === "Shoe" || formData.category === "Outerwear" || formData.category === "Clothing") && (
            <div className="space-y-4">
              <h4 className={sectionHeadCls}>
                Shape & Construction
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Silhouette</label>
                  <select
                    value={formData.silhouette}
                    onChange={(e) => onInputChange("silhouette", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Not specified</option>
                    {formData.category === "Shoe" ? (
                      <>
                        <option value="low_top">Low top</option>
                        <option value="mid_top">Mid top</option>
                        <option value="high_top">High top</option>
                      </>
                    ) : (
                      <>
                        <option value="boxy">Boxy</option>
                        <option value="straight_cut">Straight cut</option>
                        <option value="cropped">Cropped</option>
                        <option value="longline">Longline</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Closure Type</label>
                  <select
                    value={formData.closure_type}
                    onChange={(e) => onInputChange("closure_type", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Not specified</option>
                    <option value="lace_up">Lace up</option>
                    <option value="zip">Zip</option>
                    <option value="buttons">Buttons</option>
                    <option value="snaps">Snaps</option>
                    <option value="pullover">Pullover</option>
                    <option value="slingback">Slingback</option>
                    <option value="slip_on">Slip on</option>
                    <option value="buckle">Buckle</option>
                  </select>
                </div>

                {formData.category === "Outerwear" && (
                  <div>
                    <label className={labelCls}>Lining Type</label>
                    <select
                      value={formData.lining_type}
                      onChange={(e) => onInputChange("lining_type", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Not specified</option>
                      <option value="unlined">Unlined</option>
                      <option value="light_lining">Light lining</option>
                      <option value="sherpa_lining">Sherpa lining</option>
                      <option value="quilted_lining">Quilted lining</option>
                      <option value="down_filled">Down filled</option>
                    </select>
                  </div>
                )}
                
                {/* Heel Height for Women's Heels and Boots */}
                {formData.gender === "Women" && formData.category === "Shoe" && (formData.sub_category === "Heels" || formData.sub_category === "Boots") && (
                  <div>
                    <label className={labelCls}>Heel Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.heel_height_cm || ""}
                      onChange={(e) =>
                        onInputChange("heel_height_cm", e.target.value ? Number.parseFloat(e.target.value) : null)
                      }
                      className={selectCls}
                      placeholder="e.g., 8.5"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dimensions & Carry - Only for Bag/Accessory */}
          {(formData.category === "Bag" || formData.category === "Accessory") && (
            <div className="space-y-4">
              <h4 className={sectionHeadCls}>
                Dimensions & Carry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimension_width_cm || ""}
                    onChange={(e) =>
                      onInputChange(
                        "dimension_width_cm",
                        e.target.value ? Number.parseFloat(e.target.value) : null,
                      )
                    }
                    className={selectCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimension_height_cm || ""}
                    onChange={(e) =>
                      onInputChange(
                        "dimension_height_cm",
                        e.target.value ? Number.parseFloat(e.target.value) : null,
                      )
                    }
                    className={selectCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Depth (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimension_depth_cm || ""}
                    onChange={(e) =>
                      onInputChange(
                        "dimension_depth_cm",
                        e.target.value ? Number.parseFloat(e.target.value) : null,
                      )
                    }
                    className={selectCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Capacity Type</label>
                  <select
                    value={formData.capacity_type}
                    onChange={(e) => onInputChange("capacity_type", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Not specified</option>
                    <option value="compact_essentials">Compact essentials</option>
                    <option value="daily_essentials">Daily essentials</option>
                    <option value="laptop_compatible">Laptop compatible</option>
                    <option value="travel_sized">Travel sized</option>
                    <option value="statement_accessory">Statement accessory</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Carry Style</label>
                  <select
                    value={formData.carry_style}
                    onChange={(e) => onInputChange("carry_style", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Not specified</option>
                    <option value="handheld">Handheld</option>
                    <option value="shoulder">Shoulder</option>
                    <option value="crossbody">Crossbody</option>
                    <option value="convertible">Convertible</option>
                    <option value="wrist">Wrist</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sizing / Wear - Only for Watch/Jewelry */}
          {(formData.category === "Watch" || formData.category === "Jewelry") && (
            <div className="space-y-4">
              <h4 className={sectionHeadCls}>
                Sizing / Wear
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.category === "Watch" && (
                  <div>
                    <label className={labelCls}>
                      Size (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.size_mm || ""}
                      onChange={(e) =>
                        onInputChange("size_mm", e.target.value ? Number.parseFloat(e.target.value) : null)
                      }
                      className={selectCls}
                    />
                  </div>
                )}

                {formData.category === "Jewelry" && (
                  <div>
                    <label className={labelCls}>
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.length_cm || ""}
                      onChange={(e) =>
                        onInputChange("length_cm", e.target.value ? Number.parseFloat(e.target.value) : null)
                      }
                      className={selectCls}
                    />
                  </div>
                )}

                <div>
                  <label className={labelCls}>Fastening Type</label>
                  <select
                    value={formData.fastening_type}
                    onChange={(e) => onInputChange("fastening_type", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Not specified</option>
                    <option value="clasp">Clasp</option>
                    <option value="adjustable_clasp">Adjustable clasp</option>
                    <option value="buckle">Buckle</option>
                    <option value="slip_on">Slip on</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Editorial */}
          <div className="space-y-4">
            <h4 className={sectionHeadCls}>
              Editorial
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Statement Level</label>
                <select
                  value={formData.statement_level}
                  onChange={(e) => onInputChange("statement_level", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Not specified</option>
                  <option value="minimal">Minimal</option>
                  <option value="subtle_statement">Subtle statement</option>
                  <option value="bold_statement">Bold statement</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Drop Context</label>
                <select
                  value={formData.drop_context}
                  onChange={(e) => onInputChange("drop_context", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Not specified</option>
                  <option value="seasonal_release">Seasonal release</option>
                  <option value="limited_style_release">Limited style release</option>
                  <option value="core_collection">Core collection</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Replication Accuracy (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.replication_accuracy || ""}
                  onChange={(e) =>
                    onInputChange("replication_accuracy", e.target.value ? Number.parseInt(e.target.value) : null)
                  }
                  className={selectCls}
                  placeholder="1-100"
                />
                <p className="font-sans text-[9px] text-white/25 mt-1">How accurate is this replica? (1-100)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
