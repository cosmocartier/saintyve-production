"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ReviewForm, type ReviewFormValues } from "@/components/admin/reviews/review-form"
import type { AdminReview } from "@/lib/types/review"

interface ReviewPanelProps {
  isOpen: boolean
  review: AdminReview | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function ReviewPanel({ isOpen, review, onClose, onSuccess }: ReviewPanelProps) {
  const supabase = createBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (values: ReviewFormValues) => {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      if (review) {
        const { error } = await supabase
          .from("reviews")
          .update({
            customer_name: values.customer_name,
            country: values.country,
            review_date: values.review_date,
            title: values.title,
            review: values.review,
            rating: values.rating,
            product_id: values.product_id,
            published: values.published,
            media: values.media,
          })
          .eq("id", review.id)

        if (error) throw error
        onSuccess("Review updated")
      } else {
        const { error } = await supabase.from("reviews").insert({
          customer_name: values.customer_name,
          country: values.country,
          review_date: values.review_date,
          title: values.title,
          review: values.review,
          rating: values.rating,
          product_id: values.product_id,
          published: values.published,
          media: values.media,
        })

        if (error) throw error
        onSuccess("Review created")
      }
    } catch (err) {
      console.error("[v0] Review save error:", err)
      setSubmitError(err instanceof Error ? err.message : "Failed to save review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex flex-col w-full max-w-[640px] max-h-[90vh] rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/8 flex-shrink-0">
          <div>
            <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-0.5">
              {review ? "Edit" : "Manual"}
            </p>
            <h2 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90">
              {review ? "Edit Review" : "Add Review"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          <ReviewForm
            initialReview={review}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </div>
    </div>
  )
}
