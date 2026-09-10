"use client"

interface Category {
  id: string
  name: string
  parent_id: string | null
  main_category: string | null
}

interface ProductCategoriesProps {
  categories: Category[]
  selectedCategories: Set<string>
  categorySearch: string
  onCategorySearchChange: (search: string) => void
  onToggleCategory: (categoryId: string) => void
}

export function ProductCategories({
  categories,
  selectedCategories,
  categorySearch,
  onCategorySearchChange,
  onToggleCategory,
}: ProductCategoriesProps) {
  const renderCategoryOptions = () => {
    const mainCategories = categories.filter((c) => !c.parent_id)
    const options: React.ReactElement[] = []

    const searchTerm = categorySearch.toLowerCase().trim()

    mainCategories.forEach((main) => {
      const subcategories = categories.filter((c) => c.parent_id === main.id)

      // Check if main category or any subcategory matches the search
      const mainMatches = !searchTerm || main.name.toLowerCase().includes(searchTerm)
      const hasMatchingSubcategory = subcategories.some((sub) => sub.name.toLowerCase().includes(searchTerm))

      // Show main category if it matches or has matching subcategories
      if (mainMatches || hasMatchingSubcategory) {
        const isSelected = selectedCategories.has(main.id)
        options.push(
          <label
            key={main.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleCategory(main.id)}
              className="w-4 h-4 cursor-pointer accent-white rounded"
            />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">{main.name}</span>
          </label>,
        )

        // Show subcategories that match the search
        subcategories.forEach((sub) => {
          const subMatches = !searchTerm || sub.name.toLowerCase().includes(searchTerm)
          if (subMatches) {
            const isSubSelected = selectedCategories.has(sub.id)
            options.push(
              <label
                key={sub.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer ml-6 transition-all"
              >
                <input
                  type="checkbox"
                  checked={isSubSelected}
                  onChange={() => onToggleCategory(sub.id)}
                  className="w-4 h-4 cursor-pointer accent-white rounded"
                />
                <span className="font-sans text-[10px] text-white/60">└─ {sub.name}</span>
              </label>,
            )
          }
        })
      }
    })

    return options
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div>
        <label className="block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-3">
          Browsing Categories (Select Multiple)
        </label>
        <div className="flex items-start justify-between gap-4 mb-3">
          <p className="font-sans text-[9px] text-white/25 flex-1">
            Organize this product into browsing categories from the categories table. This is separate from the
            main category above.
          </p>
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => onCategorySearchChange(e.target.value)}
            className="w-48 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70 placeholder-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-white/8 p-3">
          {renderCategoryOptions()}
        </div>
        <p className="mt-2 font-sans text-[9px] text-white/25">
          Products can belong to multiple browsing categories • Selected: {selectedCategories.size}
        </p>
      </div>
    </div>
  )
}
