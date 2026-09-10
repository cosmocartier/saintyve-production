"use client"

import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Placeholder data ───────────────────────────────────────────────────────

const METRICS = [
  { label: "Orders (30d)", value: "142", delta: "+18 vs prior period" },
  { label: "Fulfillment Rate", value: "96.4%", delta: "−0.3pp vs prior period" },
  { label: "Avg. Processing Time", value: "1.8 days", delta: "+0.2 days vs prior period" },
  { label: "Pending Payout", value: "$24,310", delta: "Est. settlement in 4 days" },
]

type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Issue"

const ORDERS: {
  id: string
  region: string
  status: OrderStatus
  date: string
  total: string
}[] = [
  { id: "ORD-8821", region: "Western Europe", status: "Delivered", date: "Feb 28, 2026", total: "$3,210" },
  { id: "ORD-8820", region: "North America", status: "Shipped", date: "Feb 27, 2026", total: "$1,870" },
  { id: "ORD-8818", region: "Middle East", status: "Processing", date: "Feb 26, 2026", total: "$5,640" },
  { id: "ORD-8815", region: "Southeast Asia", status: "Delivered", date: "Feb 24, 2026", total: "$2,095" },
  { id: "ORD-8810", region: "Western Europe", status: "Issue", date: "Feb 22, 2026", total: "$980" },
]

const INVENTORY_ALERTS = [
  { item: "Dior B23 Low-Top — Black/White", sku: "DR-B23-BW-42" },
  { item: "Amiri Mx1 Suede — Sand", sku: "AM-MX1-SD-44" },
  { item: "Rick Owens DRKSHDW Ramones — Black", sku: "RO-RAM-BK-41" },
]

const PARTNER_NOTES = {
  accountManager: "Isabelle Fontaine",
  preferredRegion: "Western Europe & Middle East",
  lastReviewDate: "January 14, 2026",
}

// ─── Status badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, string> = {
  Processing: "border-white/10 bg-white/4 text-white/45",
  Shipped: "border-[#D6C7A1]/15 bg-[#D6C7A1]/5 text-[#D6C7A1]/70",
  Delivered: "border-white/12 bg-white/5 text-white/60",
  Issue: "border-red-800/30 bg-red-950/20 text-red-400/70",
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[9px] font-medium uppercase tracking-[0.16em]",
        STATUS_STYLES[status],
      ].join(" ")}
    >
      {status}
    </span>
  )
}

// ─── Card wrapper ────────────────────────────────────────────────────────────

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
        "rounded-2xl border border-white/8 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        className,
      ].join(" ")}
      style={{ backgroundColor: "#151515" }}
    >
      {children}
    </div>
  )
}

// ─── Section label ───────────────────────────────────────────────────────────

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

// ─── Stagger variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

// ─── Client Component ─────────────────────────────────────────────────────────

interface DashboardClientProps {
  partnerName: string
}

export function DashboardClient({ partnerName }: DashboardClientProps) {
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

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]/60" aria-hidden />
          <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
            Overview
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-sans text-[26px] font-light uppercase tracking-[0.1em] text-white sm:text-[32px]">
            Partner Dashboard
          </h1>
          <p className="font-sans text-[13px] font-light tracking-wide text-white/40">
            Private distribution operations for {partnerName}.
          </p>
        </div>

        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/20">
          Restricted access. Confidential data.
        </p>
      </motion.div>

      {/* Section A: Operational Snapshot */}
      <section aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="sr-only">
          Operational Snapshot
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div variants={cardVariants}>
            <SectionLabel index="A" label="Operational Snapshot" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {METRICS.map((m) => (
              <motion.div key={m.label} variants={cardVariants}>
                <DashCard>
                  <div className="space-y-2.5">
                    <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                      {m.label}
                    </p>
                    <p className="font-sans text-[28px] font-light text-white/90 sm:text-[32px]">
                      {m.value}
                    </p>
                    <p className="font-sans text-[10px] font-light tracking-wide text-white/25">
                      {m.delta}
                    </p>
                  </div>
                </DashCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Section B: Latest Orders */}
      <section aria-labelledby="orders-heading">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div variants={cardVariants}>
            <SectionLabel index="B" label="Latest Orders" />
          </motion.div>

          <motion.div variants={cardVariants}>
            <DashCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/6 hover:bg-transparent">
                      <TableHead className="px-6 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Order ID
                      </TableHead>
                      <TableHead className="px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Region
                      </TableHead>
                      <TableHead className="px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Status
                      </TableHead>
                      <TableHead className="px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Date
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORDERS.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-white/6 transition-colors hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-6 py-4 font-sans text-[11px] font-medium tracking-wide text-white/60">
                          {order.id}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-sans text-[11px] font-light text-white/45">
                          {order.region}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="px-4 py-4 font-sans text-[11px] font-light text-white/35">
                          {order.date}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-sans text-[11px] font-light text-white/55">
                          {order.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t border-white/6 px-6 py-4">
                <button
                  type="button"
                  className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 transition-colors hover:text-white/55"
                >
                  View all orders
                </button>
              </div>
            </DashCard>
          </motion.div>
        </motion.div>
      </section>

      {/* Section C + D: Inventory Alerts + Partner Notes */}
      <section aria-label="Inventory and partner info">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {/* C: Inventory Alerts */}
          <motion.div variants={cardVariants} className="space-y-4">
            <SectionLabel index="C" label="Inventory Alerts" />
            <DashCard className="space-y-0 p-0">
              {INVENTORY_ALERTS.map((item, i) => (
                <div key={item.sku}>
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-sans text-[12px] font-light text-white/70">
                        {item.item}
                      </p>
                      <p className="font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-white/25">
                        {item.sku}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-red-800/25 bg-red-950/15 px-2 py-0.5 font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-red-400/60">
                        Low
                      </span>
                      <button
                        type="button"
                        className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/25 transition-colors hover:text-white/55"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                  {i < INVENTORY_ALERTS.length - 1 && (
                    <Separator className="bg-white/5" />
                  )}
                </div>
              ))}
            </DashCard>
          </motion.div>

          {/* D: Partner Notes */}
          <motion.div variants={cardVariants} className="space-y-4">
            <SectionLabel index="D" label="Partner Notes" />
            <DashCard className="space-y-5">
              {[
                { label: "Account Manager", value: PARTNER_NOTES.accountManager },
                { label: "Preferred Region", value: PARTNER_NOTES.preferredRegion },
                { label: "Last Review Date", value: PARTNER_NOTES.lastReviewDate },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="space-y-1">
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                      {row.label}
                    </p>
                    <p className="font-sans text-[13px] font-light text-white/70">
                      {row.value}
                    </p>
                  </div>
                  {i < arr.length - 1 && <Separator className="mt-5 bg-white/5" />}
                </div>
              ))}
            </DashCard>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
