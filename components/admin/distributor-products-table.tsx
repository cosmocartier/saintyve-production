"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  slug: string
  primaryImage: string | null
}

interface DistributorProductsTableProps {
  products: Product[]
}

export function DistributorProductsTable({ products }: DistributorProductsTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products

    const query = searchQuery.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(query))
  }, [products, searchQuery])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (checked) {
      newSelected.add(productId)
    } else {
      newSelected.delete(productId)
    }
    setSelectedProducts(newSelected)
  }

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedProducts.has(p.id))
  const isSomeSelected = selectedProducts.size > 0 && !isAllSelected

  return (
    <div className="space-y-6">
      {/* Bulk Action Frame */}
      {selectedProducts.size > 0 && (
        <div className="border border-zinc-200 rounded-none bg-zinc-50 p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-600">
            {selectedProducts.size} PRODUCT{selectedProducts.size !== 1 ? "S" : ""} SELECTED
          </p>
          <div className="relative">
            <button
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white rounded-none px-4 py-2 text-sm font-medium text-zinc-900 hover:border-black hover:bg-black hover:text-white transition-colors"
            >
              Bulk actions
              <ChevronDown size={16} />
            </button>

            {bulkActionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkActionsOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-none shadow-lg z-20">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors">
                      Create Order for existing client
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors">
                      Create Order for new client
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Field */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          size={18}
        />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-zinc-200 rounded-none bg-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Products Table */}
      <div className="border border-zinc-200 rounded-none bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="w-12 p-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                    style={{
                      accentColor: "black",
                    }}
                  />
                </th>
                <th className="w-20 p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Image</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Product Name</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-sm text-zinc-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-zinc-50 transition-colors ${selectedProducts.has(product.id) ? "bg-zinc-50" : ""}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                        style={{
                          accentColor: "black",
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-sm border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-zinc-400">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-900 hover:text-black hover:underline inline-flex items-center gap-1.5 transition-colors"
                      >
                        {product.name}
                        <ExternalLink size={14} className="text-zinc-400" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Count */}
      <div className="text-sm text-zinc-500">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}
