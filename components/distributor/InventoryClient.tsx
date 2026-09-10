"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string
  name: string
  slug: string | null
  brand: string | null
  category: string | null
  price: number | null
  status: string | null
  updated_at: string | null
  created_at: string | null
  thumbnail_cf_id: string | null // cf_image_id from product_images_cf
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function cfImageUrl(cfImageId: string, variant = "grid"): string {
  // Uses the same base URL as the rest of the storefront
  const base = process.env.NEXT_PUBLIC_CF_IMAGE_DELIVERY_BASE ?? ""
  return `${base}/${cfImageId}/${variant}`
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

function formatPrice(price: number | null): string {
  if (price == null) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ─── Status Badge ────────────────────────────────────────────────────────────

type ProductStatus = "active" | "draft" | "archived" | string

const STATUS_STYLE: Record<string, string> = {
  active: "border-[#D6C7A1]/15 bg-[#D6C7A1]/5 text-[#D6C7A1]/70",
  draft: "border-white/10 bg-white/4 text-white/40",
  archived: "border-white/8 bg-white/[0.03] text-white/25",
}

function ProductStatusBadge({ status }: { status: string | null }) {
  const normalized = (status ?? "draft").toLowerCase()
  const style = STATUS_STYLE[normalized] ?? STATUS_STYLE.draft
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em]",
        style,
      ].join(" ")}
    >
      {normalized}
    </span>
  )
}

// ─── Thumbnail ───────────────────────────────────────────────────────────────

function ProductThumbnail({ cfImageId, alt }: { cfImageId: string | null; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (!cfImageId || errored) {
    return (
      <div
        className="h-[44px] w-[44px] shrink-0 rounded-xl border border-white/10"
        style={{ backgroundColor: "#1C1C1C" }}
        aria-label={`No image for ${alt}`}
      />
    )
  }

  return (
    <img
      src={cfImageUrl(cfImageId)}
      alt={alt}
      width={44}
      height={44}
      className="h-[44px] w-[44px] shrink-0 rounded-xl border border-white/10 object-cover"
      onError={() => setErrored(true)}
    />
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function InventorySkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-4 px-6 py-4">
            {/* Checkbox */}
            <div className="h-3.5 w-3.5 rounded-sm bg-white/5" />
            {/* Thumbnail */}
            <div className="h-[44px] w-[44px] shrink-0 rounded-xl bg-white/5" />
            {/* Name */}
            <div className="flex-1 space-y-1.5">
              <div
                className="h-3 rounded bg-white/5"
                style={{ width: `${48 + ((i * 37) % 40)}%` }}
              />
              <div className="h-2.5 w-24 rounded bg-white/[0.035]" />
            </div>
            {/* Category */}
            <div className="hidden h-2.5 w-20 rounded bg-white/[0.035] sm:block" />
            {/* Price */}
            <div className="hidden h-2.5 w-14 rounded bg-white/[0.035] sm:block" />
            {/* Status */}
            <div className="h-5 w-16 rounded-full bg-white/5" />
            {/* Date */}
            <div className="hidden h-2.5 w-24 rounded bg-white/[0.03] lg:block" />
          </div>
          {i < 6 && <Separator className="bg-white/[0.04]" />}
        </div>
      ))}
    </div>
  )
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────

function DashCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        className,
      ].join(" ")}
      style={{ backgroundColor: "#151515" }}
    >
      {children}
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
        {index} — {label}
      </p>
      <Separator className="bg-white/6" />
    </div>
  )
}

// ─── Stagger Variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface InventoryClientProps {
  partnerName: string
  products: InventoryProduct[]
  error?: string
}

export function InventoryClient({
  partnerName,
  products,
  error,
}: InventoryClientProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q),
    )
  }, [products, search])

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const someSelected = filtered.some((p) => selected.has(p.id)) && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Faint spotlight */}
      <div
        className="pointer-events-none absolute right-0 top-0 -z-10"
        style={{
          width: "700px",
          height: "400px",
          background:
            "radial-gradient(ellipse at 70% 0%, rgba(214,199,161,0.04) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]/60" aria-hidden />
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
            Inventory
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-sans text-[26px] font-light uppercase tracking-[0.1em] text-white sm:text-[32px]">
            Inventory
          </h1>
          <p className="font-sans text-[13px] font-light tracking-wide text-white/40">
            Live product catalog for {partnerName}.
          </p>
        </div>

        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/20">
          Restricted access. Confidential data.
        </p>
      </motion.div>

      {/* ── Inventory Table Section ──────────────────────────────────── */}
      <section aria-labelledby="inventory-heading">
        <h2 id="inventory-heading" className="sr-only">
          Product Inventory
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div variants={cardVariants}>
            <SectionLabel index="A" label="Product Catalog" />
          </motion.div>

          {/* Search row */}
          <motion.div
            variants={cardVariants}
            className="flex items-center justify-between gap-4"
          >
            {/* Count label */}
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
              Showing{" "}
              <span className="text-white/50">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "product" : "products"}
              {search.trim() && products.length !== filtered.length && (
                <span className="text-white/25">
                  {" "}
                  of {products.length}
                </span>
              )}
            </p>

            {/* Search input */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
                size={13}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className={[
                  "w-[220px] rounded-xl border border-[#2A2A2A] py-2.5 pl-9 pr-4",
                  "bg-[#1C1C1C] font-sans text-[11px] text-white/80 placeholder:text-white/22",
                  "outline-none transition-all duration-200",
                  "hover:border-white/12 focus:border-[#D6C7A1]/40 focus:shadow-[0_0_0_2px_rgba(214,199,161,0.06)]",
                ].join(" ")}
              />
            </div>
          </motion.div>

          {/* Table card */}
          <motion.div variants={cardVariants}>
            <DashCard className="overflow-hidden p-0">
              {error ? (
                /* ── Error State ── */
                <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
                  <p className="font-sans text-[12px] font-light text-white/40">
                    Unable to load inventory.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-white/8 px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/35 transition-all duration-200 hover:border-white/14 hover:text-white/60"
                  >
                    Retry
                  </button>
                </div>
              ) : filtered.length === 0 && !search.trim() ? (
                /* ── Empty State ── */
                <div className="flex items-center justify-center px-6 py-16">
                  <p className="font-sans text-[12px] font-light text-white/35">
                    No products found.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                /* ── No Results for Search ── */
                <div className="flex items-center justify-center px-6 py-16">
                  <p className="font-sans text-[12px] font-light text-white/35">
                    No products match &ldquo;{search}&rdquo;.
                  </p>
                </div>
              ) : (
                /* ── Table ── */
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/6 hover:bg-transparent">
                        {/* Select-all checkbox */}
                        <TableHead className="w-12 px-6 py-4">
                          <Checkbox
                            checked={allSelected || (someSelected ? "indeterminate" : false)}
                            onCheckedChange={toggleAll}
                            aria-label="Select all products"
                            className="h-3.5 w-3.5 rounded-sm border-white/15 bg-transparent data-[state=checked]:border-[#D6C7A1]/40 data-[state=checked]:bg-[#D6C7A1]/10 data-[state=indeterminate]:border-[#D6C7A1]/30 data-[state=indeterminate]:bg-[#D6C7A1]/5"
                          />
                        </TableHead>

                        <TableHead className="min-w-[200px] px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                          Product
                        </TableHead>
                        <TableHead className="hidden px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 sm:table-cell">
                          Category
                        </TableHead>
                        <TableHead className="hidden px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                          Status
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 lg:table-cell">
                          Updated
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filtered.map((product) => {
                        const isSelected = selected.has(product.id)
                        return (
                          <TableRow
                            key={product.id}
                            className={[
                              "border-white/6 transition-colors",
                              isSelected
                                ? "bg-white/[0.025] hover:bg-white/[0.03]"
                                : "hover:bg-white/[0.018]",
                            ].join(" ")}
                          >
                            {/* Row checkbox */}
                            <TableCell className="px-6 py-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleRow(product.id)}
                                aria-label={`Select ${product.name}`}
                                className="h-3.5 w-3.5 rounded-sm border-white/15 bg-transparent data-[state=checked]:border-[#D6C7A1]/40 data-[state=checked]:bg-[#D6C7A1]/10"
                              />
                            </TableCell>

                            {/* Product (thumbnail + name + brand) */}
                            <TableCell className="px-4 py-3.5">
                              <div className="flex items-center gap-3.5">
                                <ProductThumbnail
                                  cfImageId={product.thumbnail_cf_id}
                                  alt={product.name}
                                />
                                <div className="min-w-0 space-y-0.5">
                                  <p className="truncate font-sans text-[11px] font-medium text-white/80 max-w-[200px]">
                                    {product.name}
                                  </p>
                                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/28">
                                    {product.brand ?? "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Category */}
                            <TableCell className="hidden px-4 py-3.5 font-sans text-[11px] font-light text-white/40 sm:table-cell">
                              {product.category ?? "—"}
                            </TableCell>

                            {/* Price */}
                            <TableCell className="hidden px-4 py-3.5 font-sans text-[11px] font-light text-white/55 md:table-cell">
                              {formatPrice(product.price)}
                            </TableCell>

                            {/* Status badge */}
                            <TableCell className="px-4 py-3.5">
                              <ProductStatusBadge status={product.status} />
                            </TableCell>

                            {/* Updated */}
                            <TableCell className="hidden px-6 py-3.5 font-sans text-[11px] font-light text-white/30 lg:table-cell">
                              {formatDate(product.updated_at ?? product.created_at)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Footer: selection count */}
              {selected.size > 0 && (
                <div className="border-t border-white/6 px-6 py-3.5">
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#D6C7A1]/55">
                    {selected.size} {selected.size === 1 ? "product" : "products"} selected
                  </p>
                </div>
              )}
            </DashCard>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
