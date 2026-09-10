import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { ReviewProduct as ReviewProductType } from "@/lib/types/review"

interface ReviewProductProps {
  product: ReviewProductType
}

export function ReviewProduct({ product }: ReviewProductProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex items-center gap-3 pt-4 mt-4 border-t border-[#f0f0f0]"
    >
      <div className="w-10 h-10 flex-shrink-0 bg-zinc-50 overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <span className="text-[12px] font-mono text-black truncate flex-1">{product.name}</span>
      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}
