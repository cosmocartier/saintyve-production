"use client"

import type React from "react"

interface ProductBadgesProps {
  isBestseller: boolean
  isNewIn: boolean
  onBestsellerChange: (checked: boolean) => void
  onNewInChange: (checked: boolean) => void
}

export function ProductBadges({
  isBestseller,
  isNewIn,
  onBestsellerChange,
  onNewInChange,
}: ProductBadgesProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div>
        <label className="block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-3">Product Badges</label>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => onBestsellerChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-white rounded"
            />
            <div className="flex-1">
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">Best-Seller</span>
              <p className="font-sans text-[9px] text-white/30 mt-1">
                Display a "Best-Seller" badge on the product image
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <input
              type="checkbox"
              checked={isNewIn}
              onChange={(e) => onNewInChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-white rounded"
            />
            <div className="flex-1">
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">New In</span>
              <p className="font-sans text-[9px] text-white/30 mt-1">
                Display a "New In" badge on the product image
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
