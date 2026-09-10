"use client"

import type React from "react"

interface ProductStatusProps {
  status: string
  onStatusChange: (status: string) => void
}

export function ProductStatus({ status, onStatusChange }: ProductStatusProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
      <div>
        <label className="block font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-white/40 mb-3">Product Status</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onStatusChange("live")}
            className={`flex-1 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] rounded-xl transition-all ${
              status === "live"
                ? "bg-white/90 text-black"
                : "border border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07] hover:text-white/70"
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("draft")}
            className={`flex-1 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] rounded-xl transition-all ${
              status === "draft"
                ? "bg-white/90 text-black"
                : "border border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07] hover:text-white/70"
            }`}
          >
            Draft
          </button>
        </div>
        <p className="mt-2 font-sans text-[9px] text-white/25">
          {status === "live"
            ? "This product is currently visible to customers in your store."
            : "This product is hidden from customers and only visible in the admin dashboard."}
        </p>
      </div>
    </div>
  )
}
