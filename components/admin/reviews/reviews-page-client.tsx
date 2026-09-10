"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { resolvePrimaryImages } from "@/lib/products/resolve-primary-images"
import { ReviewsHeader } from "@/components/admin/reviews/reviews-header"
import { ReviewsFilters, type PublishedFilter } from "@/components/admin/reviews/reviews-filters"
import { ReviewsTable } from "@/components/admin/reviews/reviews-table"
import { ReviewPanel } from "@/components/admin/reviews/review-panel"
import { ConfirmDeleteDialog } from "@/components/admin/reviews/confirm-delete-dialog"
import { ToastNotification } from "@/components/admin/management/products/edit-product/toast-notification"
import type { AdminReview } from "@/lib/types/review"

const PAGE_SIZE = 20

interface ReviewsPageClientProps {
  initialReviews: AdminReview[]
  totalCount: number
}

export function ReviewsPageClient({ initialReviews, totalCount }: ReviewsPageClientProps) {
  const supabase = createBrowserClient()

  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews)
  const [total, setTotal] = useState(totalCount)
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all")

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<AdminReview | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const fetchReviews = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setIsLoadingMore(true)
      else setLoading(true)

      try {
        let query = supabase.from("reviews").select("*", { count: "exact" }).order("created_at", { ascending: false })

        if (publishedFilter === "published") query = query.eq("published", true)
        if (publishedFilter === "unpublished") query = query.eq("published", false)
        if (searchTerm.trim()) {
          query = query.or(`customer_name.ilike.%${searchTerm.trim()}%,review.ilike.%${searchTerm.trim()}%`)
        }

        const { data: rows, error, count } = await query.range(offset, offset + PAGE_SIZE - 1)

        if (error) throw error

        const productIds = Array.from(
          new Set((rows ?? []).map((r) => r.product_id).filter((id): id is string => Boolean(id))),
        )

        let productMap = new Map<string, { id: string; name: string; slug: string }>()
        let imageMap = new Map<string, string>()

        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("id, name, slug, use_cloudflare_images")
            .in("id", productIds)

          if (products) {
            products.forEach((p) => productMap.set(p.id, { id: p.id, name: p.name, slug: p.slug }))
            imageMap = await resolvePrimaryImages(supabase, products)
          }
        }

        const mapped: AdminReview[] = (rows ?? []).map((row) => {
          const product = row.product_id ? productMap.get(row.product_id) : null
          return {
            ...row,
            media: row.media ?? [],
            product: product
              ? { id: product.id, name: product.name, slug: product.slug, image: imageMap.get(product.id) ?? null }
              : null,
          }
        })

        setTotal(count ?? 0)
        setReviews((prev) => (append ? [...prev, ...mapped] : mapped))
      } catch (err) {
        console.error("[v0] Failed to fetch reviews:", err)
        setToast({ message: "Failed to load reviews", type: "error" })
      } finally {
        setLoading(false)
        setIsLoadingMore(false)
      }
    },
    [publishedFilter, searchTerm, supabase],
  )

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value)
  }

  const handlePublishedFilterChange = (value: PublishedFilter) => {
    setPublishedFilter(value)
  }

  // Refetch whenever the search term or published filter changes, skipping the initial mount
  // (the page already has server-rendered initialReviews for the default "all" view).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const t = setTimeout(() => fetchReviews(0, false), 300)
    return () => clearTimeout(t)
  }, [searchTerm, publishedFilter, fetchReviews])

  const handleLoadMore = () => {
    if (isLoadingMore) return
    fetchReviews(reviews.length, true)
  }

  const handleAddReview = () => {
    setEditingReview(null)
    setPanelOpen(true)
  }

  const handleEdit = (review: AdminReview) => {
    setEditingReview(review)
    setPanelOpen(true)
  }

  const handleClosePanel = () => {
    setPanelOpen(false)
    setEditingReview(null)
  }

  const handlePanelSuccess = (message: string) => {
    setPanelOpen(false)
    setEditingReview(null)
    setToast({ message, type: "success" })
    fetchReviews(0, false)
  }

  const handleTogglePublished = async (review: AdminReview) => {
    const nextPublished = !review.published
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, published: nextPublished } : r)))

    const { error } = await supabase.from("reviews").update({ published: nextPublished }).eq("id", review.id)

    if (error) {
      console.error("[v0] Failed to toggle published state:", error)
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, published: review.published } : r)))
      setToast({ message: "Failed to update review", type: "error" })
    } else {
      setToast({ message: nextPublished ? "Review published" : "Review unpublished", type: "success" })
    }
  }

  const handleDeleteRequest = (review: AdminReview) => {
    setDeleteTarget(review)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      await Promise.all(
        deleteTarget.media.map((item) =>
          fetch(`/api/admin/reviews/media?cfImageId=${item.cf_image_id}`, { method: "DELETE" }).catch(() => null),
        ),
      )

      const { error } = await supabase.from("reviews").delete().eq("id", deleteTarget.id)
      if (error) throw error

      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setToast({ message: "Review deleted", type: "success" })
    } catch (err) {
      console.error("[v0] Failed to delete review:", err)
      setToast({ message: "Failed to delete review", type: "error" })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <ReviewsHeader onAddReview={handleAddReview} />

      <ReviewsFilters
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        publishedFilter={publishedFilter}
        onPublishedFilterChange={handlePublishedFilterChange}
        resultCount={total}
      />

      <ReviewsTable
        reviews={reviews}
        loading={loading}
        isLoadingMore={isLoadingMore}
        hasMore={reviews.length < total}
        onLoadMore={handleLoadMore}
        onEdit={handleEdit}
        onTogglePublished={handleTogglePublished}
        onDelete={handleDeleteRequest}
      />

      <ReviewPanel isOpen={panelOpen} review={editingReview} onClose={handleClosePanel} onSuccess={handlePanelSuccess} />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
