"use client"

type GridViewMode = "product" | "catalog" | "compact"

interface GridViewProps {
  gridViewMode: GridViewMode
  onGridViewModeChange: (mode: GridViewMode) => void
}

export function GridView({ gridViewMode, onGridViewModeChange }: GridViewProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onGridViewModeChange("product")}
        className="w-3 h-3 flex items-center justify-center"
        aria-label="Product grid view"
      >
        <img
          src={gridViewMode === "product" 
            ? "/images/product-grid-filled.png"
            : "/images/product-grid-empty.png"
          }
          alt="Product grid"
          className="w-full h-full object-contain"
        />
      </button>
      <button
        onClick={() => onGridViewModeChange("catalog")}
        className="w-3 h-3 flex items-center justify-center"
        aria-label="Catalog grid view"
      >
        <img
          src={gridViewMode === "catalog"
            ? "/images/catalog-grid-filled.png"
            : "/images/catalog-grid-empty.png"
          }
          alt="Catalog grid"
          className="w-full h-full object-contain"
        />
      </button>
      <button
        onClick={() => onGridViewModeChange("compact")}
        className="w-3 h-3 flex items-center justify-center"
        aria-label="Compact grid view"
      >
        <img
          src={gridViewMode === "compact"
            ? "/images/compact-grid-filled.png"
            : "/images/compact-grid-empty.png"
          }
          alt="Compact grid"
          className="w-full h-full object-contain"
        />
      </button>
    </div>
  )
}
