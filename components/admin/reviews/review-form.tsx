"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { COUNTRIES } from "@/lib/constants/countries"
import { ReviewProductSelector, type SelectedProduct } from "@/components/admin/reviews/review-product-selector"
import { ReviewMedia } from "@/components/admin/reviews/review-media"
import { ReviewRating } from "@/components/reviews/review-rating"
import type { AdminReview, ReviewMediaItem } from "@/lib/types/review"

export interface ReviewFormValues {
  customer_name: string
  country: string
  review_date: string
  title: string
  review: string
  rating: number
  product_id: string | null
  published: boolean
  media: ReviewMediaItem[]
}

interface ReviewFormProps {
  initialReview: AdminReview | null
  onSubmit: (values: ReviewFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitError: string | null
}

const labelCls = "block font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/30 mb-1.5"
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/20 transition-colors"
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 tracking-wide focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
const sectionCls = "rounded-2xl border border-white/8 bg-white/[0.015] overflow-hidden"

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

export function ReviewForm({ initialReview, onSubmit, onCancel, isSubmitting, submitError }: ReviewFormProps) {
  const [customerName, setCustomerName] = useState(initialReview?.customer_name ?? "")
  const [country, setCountry] = useState(initialReview?.country ?? COUNTRIES[0])
  const [reviewDate, setReviewDate] = useState(initialReview?.review_date ?? todayISODate())
  const [title, setTitle] = useState(initialReview?.title ?? "")
  const [reviewText, setReviewText] = useState(initialReview?.review ?? "")
  const [rating, setRating] = useState(initialReview?.rating ?? 5)
  const [product, setProduct] = useState<SelectedProduct | null>(
    initialReview?.product ? { id: initialReview.product.id, name: initialReview.product.name, image: initialReview.product.image } : null,
  )
  const [published, setPublished] = useState(initialReview?.published ?? true)
  const [media, setMedia] = useState<ReviewMediaItem[]>(initialReview?.media ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = "Customer name is required"
    if (!country.trim()) errs.country = "Country is required"
    if (!reviewDate.trim()) errs.reviewDate = "Review date is required"
    if (!title.trim()) errs.title = "Title is required"
    if (!reviewText.trim()) errs.reviewText = "Review text is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      customer_name: customerName.trim(),
      country,
      review_date: reviewDate,
      title: title.trim(),
      review: reviewText.trim(),
      rating,
      product_id: product?.id ?? null,
      published,
      media,
    })
  }

  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <div className="px-5 py-4 border-b border-white/6">
          <span className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">
            Customer &amp; Review
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input
                type="text"
                placeholder="Alex Garcia"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputCls}
              />
              {errors.customerName && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.customerName}</p>}
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Review Date</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className={`${inputCls} max-w-[200px]`}
            />
            {errors.reviewDate && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.reviewDate}</p>}
          </div>

          <div>
            <label className={labelCls}>Rating</label>
            <ReviewRating rating={rating} mode="interactive" size="md" tone="dark" onChange={setRating} />
          </div>

          <div>
            <label className={labelCls}>Title</label>
            <input
              type="text"
              placeholder="Amazing quality and fast shipping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
            {errors.title && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className={labelCls}>Review</label>
            <textarea
              placeholder="The shoes arrived incredibly fast..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              className={`${inputCls} resize-none`}
            />
            {errors.reviewText && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.reviewText}</p>}
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="px-5 py-4 border-b border-white/6">
          <span className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">Product</span>
        </div>
        <div className="p-5">
          <ReviewProductSelector value={product} onChange={setProduct} />
        </div>
      </div>

      <div className={sectionCls}>
        <div className="p-5">
          <ReviewMedia value={media} onChange={setMedia} />
        </div>
      </div>

      <div className={sectionCls}>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] font-medium tracking-[0.18em] uppercase text-white/70">Published</p>
            <p className="font-sans text-[10px] text-white/30 mt-0.5">Visible on the public storefront</p>
          </div>
          <Switch checked={published} onCheckedChange={setPublished} />
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl px-4 py-3 font-sans text-[10px] font-medium tracking-wide border bg-red-500/10 border-red-500/20 text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-sans text-[10px] font-medium tracking-[0.16em] uppercase hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialReview ? "Save Changes" : "Create Review"}
        </button>
      </div>
    </div>
  )
}
