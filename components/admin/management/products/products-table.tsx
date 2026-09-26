"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, Edit, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  category: string | { id: string; name: string; slug: string } | null
  status: "live" | "draft"
  primaryImage: string | null
  orderCount: number
  created_at: string
  images?: { url: string; display_order: number; color_name?: string; color_hex?: string }[]
  parent_product_name?: string | null
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
        // Fetch Cloudflare images for products that use them
        const cfProductIds = newProducts.filter((p) => p.use_cloudflare_images).map((p) => p.id)
        let cfImagesMap = new Map()

        if (cfProductIds.length > 0) {
          const { data: cfImages } = await supabase
            .from("product_images_cf")
            .select("*")
            .in("product_id", cfProductIds)
            .order("sort_order", { ascending: true })

          if (cfImages) {
            cfImages.forEach((img: any) => {
              if (!cfImagesMap.has(img.product_id)) {
                cfImagesMap.set(img.product_id, [])
              }
              cfImagesMap.get(img.product_id).push(img)
            })
          }
        }

        const productsWithStats = newProducts.map((product) => {
          const orderCount = product.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
          
          // Get primary image from either source
          let primaryImage = null
          if (product.use_cloudflare_images) {
            const cfImages = cfImagesMap.get(product.id) || []
            const primaryCfImage = cfImages.find((img: any) => img.role === "primary") || cfImages[0]
            if (primaryCfImage) {
              primaryImage = `https://imagedelivery.net/lcn8llMxZeKUFR0YAKOriA/${primaryCfImage.cf_image_id}/public`
            }
          } else {
            primaryImage = product.images?.[0]?.url || null
          }

          return {
            ...product,
            orderCount,
            primaryImage,
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
    <div className="space-y-4">
      {/* Message Banner */}
      {message && (
        <div className={`rounded-xl px-4 py-3 font-sans text-[10px] font-medium tracking-wide border ${
          message.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Bulk selection bar */}
      {selectedProducts.size > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-5 py-3 flex items-center justify-between">
          <p className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/60">
            {selectedProducts.size} product{selectedProducts.size !== 1 ? "s" : ""} selected
          </p>
          <div className="relative">
            <button
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              disabled={bulkActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-30"
            >
              Bulk Actions
              <ChevronDown size={13} />
            </button>

            {bulkActionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkActionsOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-[#131313] border border-white/8 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => { handleBulkSetLive(); setBulkActionsOpen(false) }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors disabled:opacity-30"
                    >
                      Update status → Live
                    </button>
                    <button
                      onClick={() => { handleBulkSetDraft(); setBulkActionsOpen(false) }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors disabled:opacity-30"
                    >
                      Update status → Draft
                    </button>
                    <div className="border-t border-white/6 my-1" />
                    <button
                      onClick={() => { handleBulkDuplicate(); setBulkActionsOpen(false) }}
                      disabled={bulkActionLoading}
                      className="w-full text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.14em] text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors disabled:opacity-30"
                    >
                      Duplicate selected
                    </button>
                    <div className="border-t border-white/6 my-1" />
                    {["Update prices…", "Update categories…", "Edit tags…", "Export selected"].map((label) => (
                      <button key={label} disabled className="w-full text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.14em] text-white/20 cursor-not-allowed">
                        {label} (soon)
                      </button>
                    ))}
                    <div className="border-t border-white/6 my-1" />
                    <button disabled className="w-full text-left px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.14em] text-red-400/40 cursor-not-allowed">
                      Delete selected (soon)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/15 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/60 focus:outline-none focus:border-white/15 transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-white/25">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Mobile product cards */}
      <div className="space-y-3 md:hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id)}
                onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-white/60"
              />

              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-white/[0.03]">
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  {product.slug ? (
                    <a
                      href={`https://designerdrip.store/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[12px] font-medium text-white/85 underline underline-offset-2 decoration-white/20"
                    >
                      {product.name}
                    </a>
                  ) : (
                    <span className="font-sans text-[12px] font-medium text-white/85">{product.name}</span>
                  )}
                  {product.status === "live" ? (
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-white/5 text-white/30 border border-white/8">
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      Draft
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="font-sans text-[11px] font-medium text-white/70">EUR {product.price.toFixed(2)}</p>
                  <p className="font-sans text-[10px] text-white/35">{product.orderCount} ordered</p>
                </div>

                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/40 hover:bg-white/[0.07] hover:text-white/80 transition-all"
                >
                  <Edit size={11} strokeWidth={1.5} />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-white/8 py-12 text-center">
            <p className="font-sans text-[10px] uppercase tracking-widest text-white/20">No products found</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="hidden rounded-2xl border border-white/8 overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => { if (input) input.indeterminate = isSomeSelected }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 cursor-pointer accent-white/60"
                  />
                </th>
                <th className="cursor-pointer px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 hover:text-white/50 transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1.5">Product <SortIcon field="name" /></div>
                </th>
                <th className="cursor-pointer px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 hover:text-white/50 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1.5">Status <SortIcon field="status" /></div>
                </th>
                <th className="cursor-pointer px-5 py-3.5 text-right font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 hover:text-white/50 transition-colors" onClick={() => handleSort("price")}>
                  <div className="flex items-center justify-end gap-1.5">Price <SortIcon field="price" /></div>
                </th>
                <th className="cursor-pointer px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 hover:text-white/50 transition-colors" onClick={() => handleSort("orderCount")}>
                  <div className="flex items-center gap-1.5">Ordered <SortIcon field="orderCount" /></div>
                </th>
                <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Parent</th>
                <th className="px-5 py-3.5 text-center font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredProducts.map((product) => {
                const colorVariants =
                  product.images
                    ?.filter((img: any) => img.color_name)
                    .reduce((acc: Set<string>, img: any) => {
                      if (img.color_name) acc.add(img.color_name)
                      return acc
                    }, new Set<string>()).size || 0

                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="w-3.5 h-3.5 cursor-pointer accent-white/60"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        {product.slug ? (
                          <a
                            href={`https://designerdrip.store/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-[11px] font-medium text-white/80 hover:text-white transition-colors underline underline-offset-2 decoration-white/20 hover:decoration-white/50"
                          >
                            {product.name}
                          </a>
                        ) : (
                          <span className="font-sans text-[11px] font-medium text-white/80">{product.name}</span>
                        )}
                        {colorVariants > 1 && (
                          <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full font-sans text-[9px] font-medium text-white/30 bg-white/[0.03] border border-white/8">
                            +{colorVariants - 1} color{colorVariants - 1 !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {product.status === "live" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-white/5 text-white/30 border border-white/8">
                          <span className="h-1 w-1 rounded-full bg-white/30" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-sans text-[11px] font-medium text-white/70">EUR {product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-sans text-[11px] text-white/45">{product.orderCount}</div>
                    </td>
                    <td className="px-5 py-4">
                      {product.parent_product_name ? (
                        <span className="inline-block max-w-[180px] truncate font-sans text-[10px] text-white/40 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/8">
                          {product.parent_product_name}
                        </span>
                      ) : (
                        <span className="font-sans text-[11px] text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/40 hover:bg-white/[0.07] hover:text-white/80 transition-all"
                        >
                          <Edit size={11} strokeWidth={1.5} />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-sans text-[10px] uppercase tracking-widest text-white/20">No products found</p>
            </div>
          )}
        </div>
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-white/25">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white/10 border-t-white/40" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-4">
          <p className="font-sans text-[10px] uppercase tracking-widest text-white/15">All products loaded</p>
        </div>
      )}
    </div>
  )
}
