"use client"

import { useState } from "react"
import type { ProductWithVariants } from "@/lib/types/product"
import ProductForm from "./product-form"
import { Plus } from "lucide-react"

interface ProductManagementProps {
  initialProducts: ProductWithVariants[]
}

export default function ProductManagement({ initialProducts }: ProductManagementProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>(initialProducts)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null)

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: ProductWithVariants) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  const handleProductSaved = (product: ProductWithVariants) => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)))
    } else {
      setProducts([product, ...products])
    }
    handleFormClose()
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 bg-black px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-gray-800"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {isFormOpen && <ProductForm product={editingProduct} onClose={handleFormClose} onSave={handleProductSaved} />}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer border border-gray-200 transition-all hover:border-black"
            onClick={() => handleEditProduct(product)}
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.image || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{product.category}</p>
              <p className="mt-2 text-sm font-bold">${product.price}</p>
              {product.variants && product.variants.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{product.variants.length} variant(s)</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !isFormOpen && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No products yet. Add your first product to get started.</p>
        </div>
      )}
    </div>
  )
}
