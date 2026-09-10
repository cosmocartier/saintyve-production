"use client"

import { useState, useMemo, useTransition } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { addDistributorCustomer } from "@/app/actions/distributor-customers"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DistributorCustomer {
  id: string
  distributor: string
  email: string | null
  first_name: string | null
  last_name: string | null
  city: string | null
  postal_code: string | null
  street: string | null
  country: string | null
  phone: string | null
  telegram_username: string | null
  instagram_username: string | null
  snapchat_username: string | null
  created_at: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

// ─── Social Indicators ───────────────────────────────────────────────────────

function SocialIcons({
  telegram_username,
  instagram_username,
  snapchat_username,
}: {
  telegram_username: string | null
  instagram_username: string | null
  snapchat_username: string | null
}) {
  const socials = [
    { key: "tg", label: "TG", value: telegram_username },
    { key: "ig", label: "IG", value: instagram_username },
    { key: "sc", label: "SC", value: snapchat_username },
  ].filter((s) => s.value)

  if (socials.length === 0) {
    return <span className="font-sans text-[11px] font-light text-white/25">—</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {socials.map((s) => (
        <span
          key={s.key}
          title={`${s.key.toUpperCase()}: ${s.value}`}
          className="inline-flex items-center rounded border border-white/10 bg-white/[0.035] px-1.5 py-0.5 font-sans text-[8px] font-medium uppercase tracking-[0.14em] text-white/40"
        >
          {s.label}
        </span>
      ))}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function CustomersSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="h-3.5 w-3.5 rounded-sm bg-white/5" />
            <div className="flex-1 space-y-1.5">
              <div
                className="h-3 rounded bg-white/5"
                style={{ width: `${42 + ((i * 29) % 38)}%` }}
              />
              <div className="h-2.5 w-32 rounded bg-white/[0.035]" />
            </div>
            <div className="hidden h-2.5 w-24 rounded bg-white/[0.035] sm:block" />
            <div className="hidden h-2.5 w-20 rounded bg-white/[0.035] md:block" />
            <div className="flex gap-1.5">
              <div className="h-4 w-8 rounded bg-white/5" />
              <div className="h-4 w-8 rounded bg-white/5" />
            </div>
            <div className="hidden h-2.5 w-20 rounded bg-white/[0.03] lg:block" />
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

// ─── Premium Input ────────────────────────────────────────────────────────────

function PremiumInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/40"
      >
        {label}
        {required && <span className="ml-1 text-[#D6C7A1]/50">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={[
          "w-full rounded-xl border border-[#2A2A2A] px-4 py-2.5",
          "bg-[#1C1C1C] font-sans text-[11px] text-white/80 placeholder:text-white/22",
          "outline-none transition-all duration-200",
          "hover:border-white/12 focus:border-[#D6C7A1]/40 focus:shadow-[0_0_0_2px_rgba(214,199,161,0.06)]",
        ].join(" ")}
      />
    </div>
  )
}

// ─── Add Customer Panel ───────────────────────────────────────────────────────

interface AddCustomerPanelProps {
  open: boolean
  onClose: () => void
  distributorId: string
  onSuccess: (customer: DistributorCustomer) => void
}

const EMPTY_FORM = {
  email: "",
  first_name: "",
  last_name: "",
  city: "",
  postal_code: "",
  street: "",
  country: "",
  phone: "",
  telegram_username: "",
  instagram_username: "",
  snapchat_username: "",
}

function AddCustomerPanel({
  open,
  onClose,
  distributorId,
  onSuccess,
}: AddCustomerPanelProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function field(key: keyof typeof EMPTY_FORM) {
    return {
      value: form[key],
      onChange: (v: string) => setForm((prev) => ({ ...prev, [key]: v })),
    }
  }

  function handleClose() {
    setForm({ ...EMPTY_FORM })
    setError(null)
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      setError("Email, first name, and last name are required.")
      return
    }

    startTransition(async () => {
      try {
        const result = await addDistributorCustomer({
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          city: form.city.trim() || undefined,
          postal_code: form.postal_code.trim() || undefined,
          street: form.street.trim() || undefined,
          country: form.country.trim() || undefined,
          phone: form.phone.trim() || undefined,
          telegram_username: form.telegram_username.trim() || undefined,
          instagram_username: form.instagram_username.trim() || undefined,
          snapchat_username: form.snapchat_username.trim() || undefined,
        })

        if (!result.success) {
          setError(result.error)
          return
        }

        onSuccess(result.data as unknown as DistributorCustomer)
        handleClose()
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-white/8 p-0 sm:max-w-[480px]"
        style={{ backgroundColor: "#111111" }}
      >
        {/* Header */}
        <SheetHeader className="border-b border-white/6 px-7 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/30">
                01 — Add Customer
              </p>
              <SheetTitle className="font-sans text-[16px] font-light uppercase tracking-[0.1em] text-white/90">
                Add Customer
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* IDENTITY */}
            <div className="space-y-5">
              <SectionLabel index="01" label="Identity" />
              <PremiumInput
                id="ac-email"
                label="Email"
                type="email"
                placeholder="customer@example.com"
                required
                {...field("email")}
              />
              <div className="grid grid-cols-2 gap-4">
                <PremiumInput
                  id="ac-first_name"
                  label="First Name"
                  placeholder="First"
                  required
                  {...field("first_name")}
                />
                <PremiumInput
                  id="ac-last_name"
                  label="Last Name"
                  placeholder="Last"
                  required
                  {...field("last_name")}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="space-y-5">
              <SectionLabel index="02" label="Address" />
              <div className="grid grid-cols-2 gap-4">
                <PremiumInput
                  id="ac-city"
                  label="City"
                  placeholder="City"
                  {...field("city")}
                />
                <PremiumInput
                  id="ac-postal_code"
                  label="Postal Code"
                  placeholder="00000"
                  {...field("postal_code")}
                />
              </div>
              <PremiumInput
                id="ac-street"
                label="Street"
                placeholder="123 Main Street"
                {...field("street")}
              />
              <div className="grid grid-cols-2 gap-4">
                <PremiumInput
                  id="ac-country"
                  label="Country"
                  placeholder="Country"
                  {...field("country")}
                />
                <PremiumInput
                  id="ac-phone"
                  label="Phone"
                  type="tel"
                  placeholder="+1 000 000 0000"
                  {...field("phone")}
                />
              </div>
            </div>

            {/* SOCIALS */}
            <div className="space-y-5">
              <SectionLabel index="03" label="Socials" />
              <PremiumInput
                id="ac-telegram_username"
                label="Telegram"
                placeholder="@handle"
                {...field("telegram_username")}
              />
              <PremiumInput
                id="ac-instagram_username"
                label="Instagram"
                placeholder="@handle"
                {...field("instagram_username")}
              />
              <PremiumInput
                id="ac-snapchat_username"
                label="Snapchat"
                placeholder="@handle"
                {...field("snapchat_username")}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-sans text-[10px] font-medium tracking-wide text-red-400/70">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-white/6 px-7 py-5">
          <button
            type="submit"
            form="add-customer-form"
            disabled={isPending}
            className={[
              "flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 px-6 py-3",
              "font-sans text-[10px] font-medium uppercase tracking-[0.18em]",
              "transition-all duration-200",
              isPending
                ? "cursor-not-allowed text-white/25"
                : "text-white/70 hover:border-[#D6C7A1]/30 hover:text-white/90",
            ].join(" ")}
            style={{ backgroundColor: "#1A1A1A" }}
          >
            <Send size={12} aria-hidden />
            {isPending ? "Processing…" : "Add Customer"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
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

interface CustomersClientProps {
  distributorId: string
  partnerName: string
  initialCustomers: DistributorCustomer[]
  error?: string
}

export function CustomersClient({
  distributorId,
  partnerName,
  initialCustomers,
  error: initialError,
}: CustomersClientProps) {
  const [customers, setCustomers] = useState<DistributorCustomer[]>(initialCustomers)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [panelOpen, setPanelOpen] = useState(false)

  const allSelected =
    customers.length > 0 && customers.every((c) => selected.has(c.id))
  const someSelected = customers.some((c) => selected.has(c.id)) && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        customers.forEach((c) => next.delete(c.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        customers.forEach((c) => next.add(c.id))
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

  function handleAddSuccess(newCustomer: DistributorCustomer) {
    setCustomers((prev) => [newCustomer, ...prev])
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
        className="flex items-start justify-between gap-6"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]/60" aria-hidden />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
              Customers
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-sans text-[26px] font-light uppercase tracking-[0.1em] text-white sm:text-[32px]">
              Customers
            </h1>
            <p className="font-sans text-[13px] font-light tracking-wide text-white/40">
              Private customer records for this distribution partner.
            </p>
          </div>

          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/20">
            Restricted access. Confidential data.
          </p>
        </div>

        {/* Add Customer button */}
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className={[
            "mt-1 shrink-0 flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5",
            "font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-white/60",
            "transition-all duration-200 hover:border-[#D6C7A1]/30 hover:text-white/85",
          ].join(" ")}
          style={{ backgroundColor: "#1A1A1A" }}
        >
          <span className="text-[14px] leading-none" aria-hidden>+</span>
          Add Customer
        </button>
      </motion.div>

      {/* ── Customers Table Section ──────────────────────────────────── */}
      <section aria-labelledby="customers-heading">
        <h2 id="customers-heading" className="sr-only">
          Customer Records
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <motion.div variants={cardVariants}>
            <SectionLabel index="A" label="Customer Records" />
          </motion.div>

          {/* Count row */}
          <motion.div variants={cardVariants}>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
              Showing{" "}
              <span className="text-white/50">{customers.length}</span>{" "}
              {customers.length === 1 ? "customer" : "customers"}
            </p>
          </motion.div>

          {/* Table card */}
          <motion.div variants={cardVariants}>
            <DashCard className="overflow-hidden p-0">
              {initialError ? (
                /* ── Error State ── */
                <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
                  <p className="font-sans text-[12px] font-light text-white/40">
                    Unable to load customers.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-white/8 px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/35 transition-all duration-200 hover:border-white/14 hover:text-white/60"
                  >
                    Retry
                  </button>
                </div>
              ) : customers.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                  <p className="font-sans text-[12px] font-light text-white/35">
                    No customers yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    className="rounded-lg border border-white/8 px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/35 transition-all duration-200 hover:border-white/14 hover:text-white/60"
                  >
                    + Add First Customer
                  </button>
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
                            aria-label="Select all customers"
                            className="h-3.5 w-3.5 rounded-sm border-white/15 bg-transparent data-[state=checked]:border-[#D6C7A1]/40 data-[state=checked]:bg-[#D6C7A1]/10 data-[state=indeterminate]:border-[#D6C7A1]/30 data-[state=indeterminate]:bg-[#D6C7A1]/5"
                          />
                        </TableHead>

                        <TableHead className="min-w-[180px] px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                          Customer
                        </TableHead>
                        <TableHead className="hidden px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 sm:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 md:table-cell">
                          Phone
                        </TableHead>
                        <TableHead className="px-4 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                          Socials
                        </TableHead>
                        <TableHead className="hidden px-6 py-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 lg:table-cell">
                          Created
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {customers.map((customer) => {
                        const isSelected = selected.has(customer.id)
                        const fullName = [customer.first_name, customer.last_name]
                          .filter(Boolean)
                          .join(" ") || "—"
                        const location = [customer.city, customer.country]
                          .filter(Boolean)
                          .join(", ") || "—"

                        return (
                          <TableRow
                            key={customer.id}
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
                                onCheckedChange={() => toggleRow(customer.id)}
                                aria-label={`Select ${fullName}`}
                                className="h-3.5 w-3.5 rounded-sm border-white/15 bg-transparent data-[state=checked]:border-[#D6C7A1]/40 data-[state=checked]:bg-[#D6C7A1]/10"
                              />
                            </TableCell>

                            {/* Customer name + email */}
                            <TableCell className="px-4 py-3.5">
                              <div className="min-w-0 space-y-0.5">
                                <p className="truncate font-sans text-[11px] font-medium text-white/80 max-w-[200px]">
                                  {fullName}
                                </p>
                                <p className="truncate font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-white/28 max-w-[200px]">
                                  {customer.email ?? "—"}
                                </p>
                              </div>
                            </TableCell>

                            {/* Location */}
                            <TableCell className="hidden px-4 py-3.5 font-sans text-[11px] font-light text-white/40 sm:table-cell">
                              {location}
                            </TableCell>

                            {/* Phone */}
                            <TableCell className="hidden px-4 py-3.5 font-sans text-[11px] font-light text-white/45 md:table-cell">
                              {customer.phone ?? "—"}
                            </TableCell>

                            {/* Socials */}
                            <TableCell className="px-4 py-3.5">
                              <SocialIcons
                                telegram_username={customer.telegram_username}
                                instagram_username={customer.instagram_username}
                                snapchat_username={customer.snapchat_username}
                              />
                            </TableCell>

                            {/* Created */}
                            <TableCell className="hidden px-6 py-3.5 font-sans text-[11px] font-light text-white/30 lg:table-cell">
                              {formatDate(customer.created_at)}
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
                    {selected.size} {selected.size === 1 ? "customer" : "customers"} selected
                  </p>
                </div>
              )}
            </DashCard>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Add Customer Panel ───────────────────────────────────────── */}
      <AddCustomerPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        distributorId={distributorId}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
