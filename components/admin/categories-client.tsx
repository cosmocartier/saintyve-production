"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Check,
  X,
  Package,
  ArrowUpDown,
  Save,
  Loader2,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  main_category: string | null
  display_order: number
  product_count?: number
}

type Product = {
  id: string
  name: string
  price: number
  status: string
  images: { url: string }[]
  categories: string[]
  sort_order?: number // Added sort_order for product ordering within categories
}

function SortableCategoryItem({
  category,
  subcategories,
  expandedCategories,
  toggleCategory,
  onEdit,
  onDelete,
  onViewProducts,
  editingId,
  editName,
  setEditName,
  saveEdit,
  cancelEdit,
  getSubcategories,
  depth = 0,
  isOverlay = false,
}: {
  category: Category
  subcategories: Category[]
  expandedCategories: Set<string>
  toggleCategory: (id: string) => void
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onViewProducts: (categoryId: string) => void
  editingId: string | null
  editName: string
  setEditName: (name: string) => void
  saveEdit: () => void
  cancelEdit: () => void
  getSubcategories: (parentId: string) => Category[]
  depth?: number
  isOverlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: {
      type: "category",
      category,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isExpanded = expandedCategories.has(category.id)
  const isMainCategory = !category.parent_id
  const isEditing = editingId === category.id

  const marginLeft = depth > 0 ? `${depth * 2}rem` : "0"

  if (isOverlay) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-md shadow-lg">
        <GripVertical className="w-5 h-5 text-zinc-400" />
        <p className="text-sm tracking-wide uppercase font-medium">{category.name}</p>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-md hover:border-zinc-300 transition-colors"
        style={{ marginLeft }}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-zinc-400" />
        </div>

        {subcategories.length > 0 && (
          <button onClick={() => toggleCategory(category.id)} className="text-zinc-600 hover:text-black">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}

        {subcategories.length === 0 && <div className="w-5" />}

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit()
                if (e.key === "Escape") cancelEdit()
              }}
            />
            <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0">
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0">
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <p className={`text-sm tracking-wide uppercase ${isMainCategory ? "font-medium" : ""}`}>
                {category.name}
              </p>
              <p className="text-xs text-zinc-500">
                /{category.slug} {category.product_count !== undefined && `• ${category.product_count} products`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewProducts(category.id)}
                className="h-8 px-3 hover:bg-zinc-100 flex items-center gap-2"
                title="View & Add Products"
              >
                <Package className="w-4 h-4" />
                <span className="text-xs">Products</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(category)}
                className="h-8 w-8 p-0 hover:bg-zinc-100"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(category.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {isExpanded && subcategories.length > 0 && (
        <div className="mt-2 space-y-2">
          <SortableContext items={subcategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {subcategories.map((subcat) => (
              <SortableCategoryItem
                key={subcat.id}
                category={subcat}
                subcategories={getSubcategories(subcat.id)}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewProducts={onViewProducts}
                editingId={editingId}
                editName={editName}
                setEditName={setEditName}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                getSubcategories={getSubcategories}
                depth={depth + 1}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

function SortableProductItem({ product, index }: { product: Product; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-md hover:border-zinc-300 transition-colors">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-zinc-400" />
        </div>

        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-medium text-zinc-600">
          {index + 1}
        </div>

        {product.images[0] && (
          <img
            src={product.images[0].url || "/placeholder.svg"}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-sm text-zinc-500">${product.price}</p>
        </div>

        <div className="text-xs text-zinc-400 uppercase">{product.status}</div>
      </div>
    </div>
  )
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedParent, setSelectedParent] = useState<string>("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<"select" | "order">("select") // Added view mode toggle
  const [activeProduct, setActiveProduct] = useState<Product | null>(null) // For drag overlay
  const [hasOrderChanged, setHasOrderChanged] = useState(false) // Added state to track if order has changed
  const [isSavingOrder, setIsSavingOrder] = useState(false) // Added state to track if order is being saved
  const [isSaving, setIsSaving] = useState(false) // Added state for product assignment saving
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  const mainCategories = categories.filter((cat) => !cat.parent_id)
  const getSubcategories = (parentId: string) => categories.filter((cat) => cat.parent_id === parentId)

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      })
      return
    }

    try {
      const slug = newCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const parentCategory = selectedParent ? categories.find((c) => c.id === selectedParent) : null

      console.log("[v0] Creating category:", { name: newCategoryName, parent: selectedParent })

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName,
          slug: parentCategory ? `${parentCategory.main_category?.toLowerCase()}-${slug}` : slug,
          parent_id: selectedParent || null,
          main_category: parentCategory?.main_category || newCategoryName,
          display_order: categories.length,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating category:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Category created successfully:", data)
      setCategories([...categories, data])
      setNewCategoryName("")
      setSelectedParent("")
      toast({
        title: "Success",
        description: "Category created successfully",
      })
    } catch (err) {
      console.error("[v0] Exception creating category:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const saveEdit = async () => {
    if (!editName.trim() || !editingId) return

    const slug = editName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const category = categories.find((c) => c.id === editingId)
    const finalSlug = category?.parent_id ? `${category.main_category?.toLowerCase()}-${slug}` : slug

    const { error } = await supabase.from("categories").update({ name: editName, slug: finalSlug }).eq("id", editingId)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setCategories(categories.map((c) => (c.id === editingId ? { ...c, name: editName, slug: finalSlug } : c)))
    setEditingId(null)
    setEditName("")
    toast({
      title: "Success",
      description: "Category updated successfully",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const handleDelete = async (id: string) => {
    const categoryToDelete = categories.find((c) => c.id === id)
    const isMainCategory = categoryToDelete && !categoryToDelete.parent_id
    const subcategories = isMainCategory ? categories.filter((c) => c.parent_id === id) : []

    const confirmMessage =
      isMainCategory && subcategories.length > 0
        ? `Are you sure you want to delete this main category and its ${subcategories.length} subcategory(ies)? This action cannot be undone.`
        : "Are you sure you want to delete this category?"

    if (!confirm(confirmMessage)) return

    const originalCategories = [...categories]

    if (isMainCategory) {
      setCategories(categories.filter((c) => c.id !== id && c.parent_id !== id))
    } else {
      setCategories(categories.filter((c) => c.id !== id))
    }

    if (isMainCategory && subcategories.length > 0) {
      const { error: subError } = await supabase.from("categories").delete().eq("parent_id", id)

      if (subError) {
        setCategories(originalCategories)
        toast({
          title: "Error",
          description: `Failed to delete subcategories: ${subError.message}`,
          variant: "destructive",
        })
        return
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      setCategories(originalCategories)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description:
        isMainCategory && subcategories.length > 0
          ? `Main category and ${subcategories.length} subcategory(ies) deleted successfully`
          : "Category deleted successfully",
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const category = categories.find((c) => c.id === active.id)
    setActiveCategory(category || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback can be added here if needed
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCategory(null)

    if (!over || active.id === over.id) return

    const draggedCategory = categories.find((c) => c.id === active.id)
    const targetCategory = categories.find((c) => c.id === over.id)

    if (!draggedCategory || !targetCategory) return

    console.log("[v0] Drag ended:", {
      dragged: draggedCategory.name,
      target: targetCategory.name,
    })

    const isCircular = (categoryId: string, potentialParentId: string): boolean => {
      if (categoryId === potentialParentId) return true
      const parent = categories.find((c) => c.id === potentialParentId)
      if (!parent || !parent.parent_id) return false
      return isCircular(categoryId, parent.parent_id)
    }

    if (isCircular(draggedCategory.id, targetCategory.id)) {
      toast({
        title: "Invalid Move",
        description: "Cannot create circular category relationships",
        variant: "destructive",
      })
      return
    }

    try {
      const newParentId = targetCategory.id
      const newMainCategory = targetCategory.main_category || targetCategory.name

      const newSlug = draggedCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { error } = await supabase
        .from("categories")
        .update({
          parent_id: newParentId,
          main_category: newMainCategory,
          slug: `${newMainCategory.toLowerCase()}-${newSlug}`,
        })
        .eq("id", draggedCategory.id)

      if (error) {
        console.error("[v0] Error updating category:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setCategories(
        categories.map((cat) =>
          cat.id === draggedCategory.id
            ? {
                ...cat,
                parent_id: newParentId,
                main_category: newMainCategory,
                slug: `${newMainCategory.toLowerCase()}-${newSlug}`,
              }
            : cat,
        ),
      )

      setExpandedCategories((prev) => new Set([...prev, targetCategory.id]))

      toast({
        title: "Success",
        description: `Moved "${draggedCategory.name}" under "${targetCategory.name}"`,
      })
    } catch (err) {
      console.error("[v0] Exception during drag:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchProductCounts()
  }, []) // Empty dependency array to run only once

  const fetchProductCounts = async () => {
    const getAllDescendants = (categoryId: string): string[] => {
      const children = categories.filter((c) => c.parent_id === categoryId)
      let descendants = [categoryId]
      for (const child of children) {
        descendants = descendants.concat(getAllDescendants(child.id))
      }
      return descendants
    }

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        try {
          const categoryIds = getAllDescendants(cat.id)

          const { count, error } = await supabase
            .from("product_categories")
            .select("*", { count: "exact", head: true })
            .in("category_id", categoryIds)

          if (error) {
            console.error("[v0] Error fetching product count:", error)
            return { ...cat, product_count: 0 }
          }

          return { ...cat, product_count: count || 0 }
        } catch (error) {
          console.error("[v0] Exception fetching product count:", error)
          return { ...cat, product_count: 0 }
        }
      }),
    )
    setCategories(categoriesWithCounts)
  }

  const handleViewProducts = async (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setShowProductModal(true)
    setSearchTerm("")
    setViewMode("select")
    setHasOrderChanged(false)

    try {
      const { data: productCategoryData, error: pcError } = await supabase
        .from("product_categories")
        .select("product_id, sort_order")
        .eq("category_id", categoryId)

      if (pcError) {
        console.error("[v0] Error fetching product categories:", pcError)
        toast({
          title: "Error",
          description: "Failed to load product order. Please try again.",
          variant: "destructive",
        })
        return
      }

      const sortOrderMap = new Map(productCategoryData?.map((pc) => [pc.product_id, pc.sort_order ?? 999999]) || [])

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          status
        `)
        .eq("status", "live")

      if (error) {
        console.error("[v0] Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (products) {
        const productsWithDetails = await Promise.all(
          products.map(async (p) => {
            const { data: images } = await supabase
              .from("product_images")
              .select("url")
              .eq("product_id", p.id)
              .order("display_order")
              .limit(1)
              .single()

            const { data: productCategories, error: pcError } = await supabase
              .from("product_categories")
              .select("category_id, sort_order")
              .eq("product_id", p.id)

            if (pcError) {
              console.error("[v0] Error fetching product categories:", pcError)
              return {
                ...p,
                images: images ? [images] : [],
                categories: [],
                sort_order: 999999,
              }
            }

            return {
              ...p,
              images: images ? [images] : [],
              categories: productCategories?.map((pc) => pc.category_id) || [],
              sort_order: sortOrderMap.get(p.id) ?? 999999,
            }
          }),
        )

        const productsInCategory = productsWithDetails.filter((p) => p.categories.includes(categoryId))
        const productsNotInCategory = productsWithDetails.filter((p) => !p.categories.includes(categoryId))

        const sortedInCategory = productsInCategory.sort((a, b) => a.sort_order - b.sort_order)
        const sortedNotInCategory = productsNotInCategory.sort((a, b) => a.name.localeCompare(b.name))

        const sortedProducts = [...sortedInCategory, ...sortedNotInCategory]

        console.log(
          "[v0] Loaded Live products in order:",
          sortedInCategory.slice(0, 5).map((p) => ({ name: p.name, sort_order: p.sort_order })),
        )

        setAllProducts(sortedProducts)

        const productsInCategoryIds = productsInCategory.map((p) => p.id)
        setSelectedProducts(new Set(productsInCategoryIds))
      }
    } catch (error) {
      console.error("[v0] Exception fetching product details:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const saveProductAssignments = async () => {
    if (!selectedCategoryId) return

    setIsSaving(true)

    try {
      // Fetch current assignments with their sort_order
      const { data: currentAssignments } = await supabase
        .from("product_categories")
        .select("product_id, sort_order")
        .eq("category_id", selectedCategoryId)

      const currentProductIds = new Set(currentAssignments?.map((a) => a.product_id) || [])

      const toAdd = [...selectedProducts].filter((id) => !currentProductIds.has(id))
      const toRemove = [...currentProductIds].filter((id) => !selectedProducts.has(id))

      const maxSortOrder =
        currentAssignments && currentAssignments.length > 0
          ? Math.max(...currentAssignments.map((a) => a.sort_order ?? 0))
          : -1

      if (toAdd.length > 0) {
        const { error: insertError } = await supabase.from("product_categories").insert(
          toAdd.map((productId, index) => ({
            product_id: productId,
            category_id: selectedCategoryId,
            sort_order: maxSortOrder + 1 + index, // Sequential ordering
          })),
        )

        if (insertError) throw insertError
      }

      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_categories")
          .delete()
          .eq("category_id", selectedCategoryId)
          .in("product_id", toRemove)

        if (deleteError) throw deleteError
      }

      toast({
        title: "Success",
        description: `Updated ${toAdd.length + toRemove.length} product(s)`,
      })

      setShowProductModal(false)
      fetchProductCounts()

      if (toAdd.length > 0) {
        await loadCategoryProducts(selectedCategoryId)
      }
    } catch (err) {
      console.error("[v0] Error saving product assignments:", err)
      toast({
        title: "Error",
        description: "Failed to update product assignments",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const saveProductOrder = async () => {
    if (!selectedCategoryId) return

    setIsSavingOrder(true)

    try {
      const productsInCategory = allProducts
        .filter((p) => p.categories.includes(selectedCategoryId))
        .sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999))

      const updates = productsInCategory.map((product, index) => ({
        product_id: product.id,
        category_id: selectedCategoryId,
        sort_order: index,
      }))

      console.log("[v0] Saving product order for category:", selectedCategoryId)
      console.log("[v0] Updating", updates.length, "products")

      const { error: upsertError } = await supabase.from("product_categories").upsert(updates, {
        onConflict: "product_id,category_id",
        ignoreDuplicates: false,
      })

      if (upsertError) {
        console.error("[v0] Error upserting product order:", upsertError)
        toast({
          title: "Error",
          description: "Failed to save product order.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Product order saved successfully.",
      })

      setHasOrderChanged(false)
      await fetchProductCounts()
    } catch (error) {
      console.error("[v0] Exception saving product order:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSavingOrder(false)
    }
  }

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayProducts =
    viewMode === "order"
      ? filteredProducts
          .filter((p) => p.categories.includes(selectedCategoryId!))
          .sort((a, b) => (a.sort_order ?? 999999) - (b.sort_order ?? 999999))
      : filteredProducts

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const handleProductDragStart = (event: DragStartEvent) => {
    const { active } = event
    const product = allProducts.find((p) => p.id === active.id)
    setActiveProduct(product || null)
  }

  const handleProductDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProduct(null)

    if (!over || active.id === over.id || !selectedCategoryId) return

    const draggedProduct = allProducts.find((p) => p.id === active.id)
    const targetProduct = allProducts.find((p) => p.id === over.id)

    if (!draggedProduct || !targetProduct) return

    console.log("[v0] Product drag ended:", {
      dragged: draggedProduct.name,
      target: targetProduct.name,
      category: selectedCategoryId,
    })

    setAllProducts((prev) => {
      // Get only products in the current category
      const productsInCategory = prev.filter((p) => p.categories.includes(selectedCategoryId))
      const productsNotInCategory = prev.filter((p) => !p.categories.includes(selectedCategoryId))

      // Find indices within the category
      const draggedIndex = productsInCategory.findIndex((p) => p.id === draggedProduct.id)
      const targetIndex = productsInCategory.findIndex((p) => p.id === targetProduct.id)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      // Reorder within the category
      const reordered = [...productsInCategory]
      reordered.splice(draggedIndex, 1)
      reordered.splice(targetIndex, 0, draggedProduct)

      // Update sort_order for products in this category
      const withUpdatedOrder = reordered.map((product, index) => ({
        ...product,
        sort_order: index,
      }))

      // Merge back with products not in this category
      return [...withUpdatedOrder, ...productsNotInCategory]
    })

    setHasOrderChanged(true)
  }

  // Helper function to build hierarchical category list for parent selector
  const buildHierarchicalCategories = () => {
    const result: Array<{ category: Category; depth: number }> = []

    const addCategoryAndChildren = (category: Category, depth: number) => {
      result.push({ category, depth })
      const children = categories
        .filter((c) => c.parent_id === category.id)
        .sort((a, b) => a.display_order - b.display_order)

      children.forEach((child) => addCategoryAndChildren(child, depth + 1))
    }

    // Get main categories sorted by display_order
    const mainCats = categories.filter((cat) => !cat.parent_id).sort((a, b) => a.display_order - b.display_order)

    mainCats.forEach((cat) => addCategoryAndChildren(cat, 0))

    return result
  }

  const loadCategoryProducts = async (categoryId: string) => {
    try {
      const { data: productCategoryData, error: pcError } = await supabase
        .from("product_categories")
        .select("product_id, sort_order")
        .eq("category_id", categoryId)

      if (pcError) {
        console.error("[v0] Error fetching product categories:", pcError)
        toast({
          title: "Error",
          description: "Failed to load product order. Please try again.",
          variant: "destructive",
        })
        return
      }

      const sortOrderMap = new Map(productCategoryData?.map((pc) => [pc.product_id, pc.sort_order ?? 999999]) || [])

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          status
        `)
        .eq("status", "live")

      if (error) {
        console.error("[v0] Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (products) {
        const productsWithDetails = await Promise.all(
          products.map(async (p) => {
            const { data: images } = await supabase
              .from("product_images")
              .select("url")
              .eq("product_id", p.id)
              .order("display_order")
              .limit(1)
              .single()

            const { data: productCategories, error: pcError } = await supabase
              .from("product_categories")
              .select("category_id, sort_order")
              .eq("product_id", p.id)

            if (pcError) {
              console.error("[v0] Error fetching product categories:", pcError)
              return {
                ...p,
                images: images ? [images] : [],
                categories: [],
                sort_order: 999999,
              }
            }

            return {
              ...p,
              images: images ? [images] : [],
              categories: productCategories?.map((pc) => pc.category_id) || [],
              sort_order: sortOrderMap.get(p.id) ?? 999999,
            }
          }),
        )

        const productsInCategory = productsWithDetails.filter((p) => p.categories.includes(categoryId))
        const productsNotInCategory = productsWithDetails.filter((p) => !p.categories.includes(categoryId))

        const sortedInCategory = productsInCategory.sort((a, b) => a.sort_order - b.sort_order)
        const sortedNotInCategory = productsNotInCategory.sort((a, b) => a.name.localeCompare(b.name))

        const sortedProducts = [...sortedInCategory, ...sortedNotInCategory]

        console.log(
          "[v0] Loaded Live products in order:",
          sortedInCategory.slice(0, 5).map((p) => ({ name: p.name, sort_order: p.sort_order })),
        )

        setAllProducts(sortedProducts)

        const productsInCategoryIds = productsInCategory.map((p) => p.id)
        setSelectedProducts(new Set(productsInCategoryIds))
      }
    } catch (error) {
      console.error("[v0] Exception fetching product details:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-50 border border-zinc-200 rounded-md p-6">
        <h2 className="text-lg font-medium tracking-widest uppercase mb-4">ADD NEW CATEGORY</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory()
            }}
            className="flex-1"
          />
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Main Category</option>
            {buildHierarchicalCategories().map(({ category, depth }) => {
              const indent = "—".repeat(depth)
              return (
                <option key={category.id} value={category.id}>
                  {indent} {category.name}
                </option>
              )
            })}
          </select>
          <Button onClick={handleAddCategory} className="bg-black text-white hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" />
            ADD
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-widest uppercase">ALL CATEGORIES</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {mainCategories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  subcategories={getSubcategories(category.id)}
                  expandedCategories={expandedCategories}
                  toggleCategory={toggleCategory}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewProducts={handleViewProducts}
                  editingId={editingId}
                  editName={editName}
                  setEditName={setEditName}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                  getSubcategories={getSubcategories}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCategory ? (
              <SortableCategoryItem
                category={activeCategory}
                subcategories={[]}
                expandedCategories={new Set()}
                toggleCategory={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                onViewProducts={() => {}}
                editingId={null}
                editName=""
                setEditName={() => {}}
                saveEdit={() => {}}
                cancelEdit={() => {}}
                getSubcategories={() => []}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium tracking-widest uppercase">
                  {viewMode === "select" ? "Select Products" : "Arrange Product Order"} in {selectedCategory?.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)} className="h-8 w-8 p-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  variant={viewMode === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("select")}
                  className={viewMode === "select" ? "bg-black text-white" : ""}
                >
                  Select Products
                </Button>
                <Button
                  variant={viewMode === "order" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("order")}
                  className={viewMode === "order" ? "bg-black text-white" : ""}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Arrange Order
                </Button>
              </div>

              {viewMode === "select" && (
                <>
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-zinc-500 mt-2">
                    {selectedProducts.size} product(s) selected • Products can belong to multiple categories
                  </p>
                </>
              )}

              {viewMode === "order" && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    Drag products to reorder them. This order will be reflected on the frontend.
                  </p>
                  {hasOrderChanged && <p className="text-sm text-amber-600 font-medium">Unsaved changes</p>}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewMode === "select" ? (
                <div className="grid grid-cols-1 gap-3">
                  {displayProducts.map((product) => {
                    const isSelected = selectedProducts.has(product.id)
                    const otherCategoryCount =
                      product.categories.length - (product.categories.includes(selectedCategoryId!) ? 1 : 0)

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${
                          isSelected ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-black border-black" : "border-zinc-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {product.images[0] && (
                          <img
                            src={product.images[0].url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-sm text-zinc-500">${product.price}</p>
                          {otherCategoryCount > 0 && (
                            <p className="text-xs text-zinc-400 mt-1">
                              Also in {otherCategoryCount} other {otherCategoryCount === 1 ? "category" : "categories"}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-zinc-400 uppercase">{product.status}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleProductDragStart}
                  onDragEnd={handleProductDragEnd}
                >
                  <SortableContext items={displayProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {displayProducts.map((product, index) => (
                        <SortableProductItem key={product.id} product={product} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeProduct ? (
                      <div className="flex items-center gap-4 p-4 bg-white border-2 border-black rounded-md shadow-lg">
                        <GripVertical className="w-5 h-5 text-zinc-400" />
                        {activeProduct.images[0] && (
                          <img
                            src={activeProduct.images[0].url || "/placeholder.svg"}
                            alt={activeProduct.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <p className="font-medium text-sm">{activeProduct.name}</p>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}

              {displayProducts.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  {viewMode === "order"
                    ? "No products in this category. Switch to 'Select Products' to add some."
                    : "No products found"}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowProductModal(false)}>
                {viewMode === "order" ? "Close" : "Cancel"}
              </Button>
              {viewMode === "select" && (
                <Button
                  onClick={saveProductAssignments}
                  disabled={isSaving}
                  className="bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
              {viewMode === "order" && (
                <Button
                  onClick={saveProductOrder}
                  disabled={!hasOrderChanged || isSavingOrder}
                  className="bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
