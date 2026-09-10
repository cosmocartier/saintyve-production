"use client"

import Image from "next/image"
import { ImageOff, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCountryFlag } from "@/lib/reviews/country-flag"
import { buildCfUrl } from "@/lib/cloudflare/cloudflare-images"
import { ReviewRating } from "@/components/reviews/review-rating"
import type { AdminReview } from "@/lib/types/review"

interface ReviewRowProps {
  review: AdminReview
  onEdit: (review: AdminReview) => void
  onTogglePublished: (review: AdminReview) => void
  onDelete: (review: AdminReview) => void
}

export function ReviewRow({ review, onEdit, onTogglePublished, onDelete }: ReviewRowProps) {
  const firstMediaThumb = review.media[0] ? buildCfUrl(review.media[0].cf_image_id, "grid") : null

  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-4 cursor-pointer" onClick={() => onEdit(review)}>
        <div className="flex items-center gap-2">
          <span className="text-[13px] leading-none">{getCountryFlag(review.country)}</span>
          <p className="font-sans text-[11px] font-medium text-white/80">{review.customer_name}</p>
        </div>
      </td>
      <td className="px-5 py-4 cursor-pointer max-w-[320px]" onClick={() => onEdit(review)}>
        <p className="font-sans text-[11px] text-white/45 truncate">{review.review}</p>
      </td>
      <td className="px-5 py-4">
        <ReviewRating rating={review.rating} size="xs" tone="dark" />
      </td>
      <td className="px-5 py-4">
        {review.product ? (
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/8">
              {review.product.image ? (
                <Image src={review.product.image} alt={review.product.name} fill className="object-cover" sizes="32px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff size={12} className="text-white/20" />
                </div>
              )}
            </div>
            <span className="font-sans text-[11px] text-white/60 truncate max-w-[140px]">{review.product.name}</span>
          </div>
        ) : (
          <span className="font-sans text-[11px] text-white/20">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className="font-sans text-[11px] text-white/30">
          {new Date(review.review_date).toLocaleDateString()}
        </span>
      </td>
      <td className="px-5 py-4">
        {firstMediaThumb ? (
          <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/8">
            <Image src={firstMediaThumb} alt="Review media" fill className="object-cover" sizes="32px" />
            {review.media.length > 1 && (
              <span className="absolute bottom-0 right-0 bg-black/70 text-white/80 text-[8px] font-medium px-1 rounded-tl-md">
                +{review.media.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span className="font-sans text-[10px] text-white/15">No media</span>
        )}
      </td>
      <td className="px-5 py-4">
        {review.published ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-white/5 text-white/30 border border-white/8">
            <span className="h-1 w-1 rounded-full bg-white/30" />
            Unpublished
          </span>
        )}
      </td>
      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors focus:outline-none">
              <MoreHorizontal size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-[#151515] text-white border-white/10">
              <DropdownMenuItem
                className="cursor-pointer text-[11px] hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onEdit(review)}
              >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-[11px] hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onTogglePublished(review)}
              >
                {review.published ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-[11px] text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
                onClick={() => onDelete(review)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}
