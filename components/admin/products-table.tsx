"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, Edit, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  price: number
  category: string | { id: string; name: string; slug: string } | null
  status: "live" | "draft"
  primaryImage: string | null
  orderCount: number
  created_at: string
  images?: { url: string; display_order: number; color_name?: string; color_hex?: string }[]
  parent_product_name?: string | null // Changed from parent_product_id to parent_product_name
}

interface ProductsTableProps {
  initialProducts: Product[]
  categoryId?: string
  totalCount: number
}

const ITEMS_PER_PAGE = 20

type SortField = "created_at" | "name" | "category" | "status" | "price" | "orderCount"
type SortDirection = "asc" | "desc"

export default function ProductsTable({ initialProducts, categoryId, totalCount }: ProductsTableProps) {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)

  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(
      products.map((p) => (typeof p.category === "string" ? p.category : p.category?.name)).filter(Boolean),
    )
    return Array.from(cats).sort()
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => {
        const categoryName = typeof p.category === "string" ? p.category : p.category?.name
        return p.name.toLowerCase().includes(query) || categoryName?.toLowerCase().includes(query)
      })
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => {
        const categoryName = typeof p.category === "string" ? p.category : p.category?.name
        return categoryName === categoryFilter
      })
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === "name" || sortField === "category" || sortField === "status") {
        if (sortField === "category") {
          aVal = typeof a.category === "string" ? a.category : a.category?.name || ""
          bVal = typeof b.category === "string" ? b.category : b.category?.name || ""
        }
        if (sortField === "status") {
          aVal = a.status === "live" ? 1 : 0
          bVal = b.status === "live" ? 1 : 0
        }
        aVal = (aVal as string)?.toLowerCase() || ""
        bVal = (bVal as string)?.toLowerCase() || ""
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [products, searchQuery, categoryFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

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

  const handleBulkSetLive = async () => {
    if (selectedProducts.size === 0) return

    setBulkActionLoading(true)
    try {
      const productIds = Array.from(selectedProducts)
      const { error } = await supabase.from("products").update({ status: "live" }).in("id", productIds)

      if (error) throw error

      // Update local state
      setProducts(products.map((p) => (selectedProducts.has(p.id) ? { ...p, status: "live" as const } : p)))

      setMessage({ type: "success", text: `${selectedProducts.size} product(s) set to LIVE` })
      setSelectedProducts(new Set())
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error("[v0] Error setting products to live:", err)
      setMessage({ type: "error", text: "Failed to update products" })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkSetDraft = async () => {
    if (selectedProducts.size === 0) return

    setBulkActionLoading(true)
    try {
      const productIds = Array.from(selectedProducts)
      const { error } = await supabase.from("products").update({ status: "draft" }).in("id", productIds)

      if (error) throw error

      // Update local state
      setProducts(products.map((p) => (selectedProducts.has(p.id) ? { ...p, status: "draft" as const } : p)))

      setMessage({ type: "success", text: `${selectedProducts.size} product(s) set to DRAFT` })
      setSelectedProducts(new Set())
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error("[v0] Error setting products to draft:", err)
      setMessage({ type: "error", text: "Failed to update products" })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedProducts.size === 0) return

    if (!confirm(`Duplicate ${selectedProducts.size} product(s)? This will create new draft copies.`)) return

    setBulkActionLoading(true)
    setMessage(null)
    try {
      const productIds = Array.from(selectedProducts)
      console.log("[v0] Starting duplication for product IDs:", productIds)

      const newProductIds: string[] = []

      for (const productId of productIds) {
        const product = products.find((p) => p.id === productId)
        if (!product) {
          console.log("[v0] Product not found in local state:", productId)
          continue
        }

        const { data: fullProduct, error: fetchError } = await supabase
          .from("products")
          .select(`
            *,
            product_categories(category_id, sort_order)
          `)
          .eq("id", productId)
          .single()

        if (fetchError) {
          console.error("[v0] Error fetching product for duplication:", fetchError)
          throw new Error(`Failed to fetch product "${product.name}": ${fetchError.message}`)
        }

        console.log(
          "[v0] Fetched full product data:",
          fullProduct.name,
          "Categories:",
          fullProduct.product_categories?.length,
        )

        // Create new product (draft by default)
        const newSlug = `${fullProduct.slug}-copy-${Date.now()}`
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            name: `${fullProduct.name} (Copy)`,
            slug: newSlug,
            description: fullProduct.description,
            price: fullProduct.price,
            category: fullProduct.category,
            status: "draft",
            image_folder: fullProduct.image_folder,
            parent_product_id: fullProduct.id, // Added parent product ID
          })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Error inserting new product:", insertError)
          throw new Error(`Failed to create duplicate of "${fullProduct.name}": ${insertError.message}`)
        }

        if (!newProduct || !newProduct.id) {
          throw new Error(`Product created but no ID returned for "${fullProduct.name}"`)
        }

        console.log("[v0] ✓ Created new product in database:", newProduct.id, newProduct.name)
        newProductIds.push(newProduct.id)

        const { data: verifyProduct, error: verifyError } = await supabase
          .from("products")
          .select("id, name")
          .eq("id", newProduct.id)
          .single()

        if (verifyError || !verifyProduct) {
          throw new Error(`Product insert verification failed for "${newProduct.name}"`)
        }
        console.log("[v0] ✓ Verified product exists in database:", verifyProduct.id)

        if (fullProduct.product_categories?.length > 0) {
          const { data: insertedCategories, error: categoriesError } = await supabase
            .from("product_categories")
            .insert(
              fullProduct.product_categories.map((pc: any) => ({
                product_id: newProduct.id,
                category_id: pc.category_id,
                sort_order: pc.sort_order,
              })),
            )
            .select()

          if (categoriesError) {
            console.error("[v0] Error inserting categories:", categoriesError)
            throw new Error(`Failed to duplicate categories for "${newProduct.name}": ${categoriesError.message}`)
          }
          console.log("[v0] ✓ Inserted", insertedCategories?.length || 0, "categories")
        } else {
          console.log("[v0] No categories to duplicate")
        }
      }

      console.log("[v0] ✓ Duplication complete for", newProductIds.length, "products:", newProductIds)

      console.log("[v0] Refreshing products list...")
      const { data: refreshedProducts, error: refreshError } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(url, display_order, color_name),
          order_items(quantity)
        `)
        .order("created_at", { ascending: false })

      if (refreshError) {
        console.error("[v0] Error refreshing products:", refreshError)
        throw new Error(`Products duplicated but failed to refresh list: ${refreshError.message}`)
      }

      if (!refreshedProducts) {
        throw new Error("No products returned from refresh query")
      }

      console.log("[v0] ✓ Refreshed products count:", refreshedProducts.length)

      const newProductsFound = newProductIds.filter((id) => refreshedProducts.some((p) => p.id === id))
      console.log("[v0] ✓ Verified", newProductsFound.length, "of", newProductIds.length, "new products in refresh")

      const productsWithStats = refreshedProducts.map((product) => {
        const orderCount = product.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
        return {
          ...product,
          orderCount,
          primaryImage: product.images?.[0]?.url || null,
          status: product.status || "draft",
        }
      })

      setProducts(productsWithStats)
      console.log("[v0] ✓ Local state updated with", productsWithStats.length, "products")

      setMessage({
        type: "success",
        text: `Successfully duplicated ${selectedProducts.size} product(s). Check the products table in Supabase to verify.`,
      })
      setSelectedProducts(new Set())
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.error("[v0] ❌ Duplication error:", err)
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to duplicate products. Check console for details.",
      })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedProducts.has(p.id))
  const isSomeSelected = selectedProducts.size > 0 && !isAllSelected

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, products.length])

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const from = products.length
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from("products")
        .select(`
          *,
          images:product_images(url, display_order),
          order_items(quantity),
          category:categories(id, name, slug)
        `)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      const { data: newProducts, error } = await query

      if (error) {
        console.error("[v0] Error loading more products:", error)
        return
      }

      if (newProducts && newProducts.length > 0) {
        const productsWithStats = newProducts.map((product) => {
          const orderCount = product.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
          return {
            ...product,
            orderCount,
            primaryImage: product.images?.[0]?.url || null,
            status: product.status || "draft",
          }
        })

        setProducts((prev) => [...prev, ...productsWithStats])
        setHasMore(products.length + newProducts.length < totalCount)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("[v0] Error in loadMore:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div
          className={`border-2 rounded p-4 ${
            message.type === "success" ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
          }`}
        >
          <p
            className={`text-sm font-mono font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {selectedProducts.size > 0 && (
        <div className="border border-zinc-200 rounded-md bg-zinc-50 p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-600">
            {selectedProducts.size} PRODUCT{selectedProducts.size !== 1 ? "S" : ""} SELECTED
          </p>
          <div className="relative">
            <button
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              disabled={bulkActionLoading}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white rounded-md px-4 py-2 text-sm font-medium text-zinc-900 hover:border-black hover:bg-black hover:text-white"
            >
              Bulk actions
              <ChevronDown size={16} />
            </button>

            {bulkActionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkActionsOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleBulkSetLive()
                        setBulkActionsOpen(false)
                      }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      Update status → Live
                    </button>
                    <button
                      onClick={() => {
                        handleBulkSetDraft()
                        setBulkActionsOpen(false)
                      }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      Update status → Draft
                    </button>
                    <div className="border-t border-zinc-200 my-1" />
                    <button
                      onClick={() => {
                        handleBulkDuplicate()
                        setBulkActionsOpen(false)
                      }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      Duplicate selected
                    </button>
                    <div className="border-t border-zinc-200 my-1" />
                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
                    >
                      Update prices… (Coming soon)
                    </button>
                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
                    >
                      Update categories… (Coming soon)
                    </button>
                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
                    >
                      Edit tags… (Coming soon)
                    </button>
                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
                    >
                      Export selected (Coming soon)
                    </button>
                    <div className="border-t border-zinc-200 my-1" />
                    <button
                      disabled
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-not-allowed opacity-50"
                    >
                      Delete selected (Coming soon)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Refined Search and Filter Section */}
      <div className="flex flex-col gap-4 border border-zinc-200 rounded-md p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 border border-zinc-300 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 border border-zinc-300 rounded-md px-4 py-2 text-sm font-medium text-zinc-900 focus:border-black focus:outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm font-medium text-zinc-500">
          {filteredProducts.length} PRODUCT{filteredProducts.length !== 1 ? "S" : ""}
        </div>
      </div>

      {/* Refined Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-md">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wide">Image</th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wide hover:bg-zinc-100 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Product
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wide hover:bg-zinc-100 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-zinc-700 uppercase tracking-wide hover:bg-zinc-100 transition-colors"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  <SortIcon field="price" />
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wide hover:bg-zinc-100 transition-colors"
                onClick={() => handleSort("orderCount")}
              >
                <div className="flex items-center gap-2">
                  Ordered
                  <SortIcon field="orderCount" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wide">Parent</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-zinc-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredProducts.map((product) => {
              const colorVariants =
                product.images
                  ?.filter((img: any) => img.color_name)
                  .reduce((acc: Set<string>, img: any) => {
                    if (img.color_name) acc.add(img.color_name)
                    return acc
                  }, new Set<string>()).size || 0

              return (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-100" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-sm font-medium text-zinc-900">{product.name}</div>
                      {colorVariants > 1 && (
                        <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200">
                          +{colorVariants - 1} color{colorVariants - 1 !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.status === "live" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-xs font-medium text-zinc-700">LIVE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
                        <span className="text-xs font-medium text-zinc-500">DRAFT</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-medium text-zinc-900">EUR {product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-zinc-700">{product.orderCount}</div>
                  </td>
                  <td className="px-4 py-3">
                    {product.parent_product_name ? (
                      <div className="text-xs font-medium text-zinc-600 bg-zinc-50 px-2 py-1 rounded border border-zinc-200 inline-block max-w-[200px] truncate">
                        {product.parent_product_name}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1.5 border border-zinc-300 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-black hover:bg-black hover:text-white"
                      >
                        <Edit size={14} strokeWidth={1.5} />
                        EDIT
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-zinc-500">No products found</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
              Loading more products...
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">All products loaded</p>
        </div>
      )}
    </div>
  )
}
