"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Search, X, ImageOff } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { resolvePrimaryImages } from "@/lib/products/resolve-primary-images"

export interface SelectedProduct {
  id: string
  name: string
  image: string | null
}

interface ReviewProductSelectorProps {
  value: SelectedProduct | null
  onChange: (product: SelectedProduct | null) => void
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/20 transition-colors"

export function ReviewProductSelector({ value, onChange }: ReviewProductSelectorProps) {
  const supabase = createBrowserClient()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SelectedProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    const t = setTimeout(async () => {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, use_cloudflare_images")
        .ilike("name", `%${query}%`)
        .limit(8)

      if (!products || products.length === 0) {
        setResults([])
        setIsSearching(false)
        return
      }

      const imageMap = await resolvePrimaryImages(supabase, products)
      setResults(products.map((p) => ({ id: p.id, name: p.name, image: imageMap.get(p.id) ?? null })))
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3.5 py-2.5">
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/8">
            {value.image ? (
              <Image src={value.image} alt={value.name} fill className="object-cover" sizes="32px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff size={12} className="text-white/20" />
              </div>
            )}
          </div>
          <span className="flex-1 font-sans text-[11px] text-white/80 truncate">{value.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className={`${inputCls} pl-9`}
            />
          </div>
          {showResults && query.trim().length >= 2 && (
            <div className="absolute z-20 mt-1.5 w-full rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              {isSearching ? (
                <p className="px-4 py-3 font-sans text-[10px] uppercase tracking-widest text-white/25">Searching...</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-3 font-sans text-[10px] uppercase tracking-widest text-white/25">No products found</p>
              ) : (
                results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onChange(product)
                      setQuery("")
                      setResults([])
                      setShowResults(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/8">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="28px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff size={10} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <span className="font-sans text-[11px] text-white/80 truncate">{product.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
