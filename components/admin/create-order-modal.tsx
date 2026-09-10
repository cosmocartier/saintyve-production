"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  Tag,
  CreditCard,
  FileText,
  Check,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { createOrderAction, validateCoupon } from "@/app/actions/create-order"
import { COUNTRIES } from "@/lib/constants/countries"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Profile {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_country: string | null
  credits: number
}

interface ProductVariant {
  id: string
  size: string
  color: string | null
  sku: string | null
  stock_quantity: number | null
  price_adjustment: number | null
}

interface Product {
  id: string
  name: string
  price: number
  discounted_price: number | null
  image_folder: string | null
  slug: string
  variants: ProductVariant[]
  image_url: string | null
}

interface LineItem {
  key: string // unique key for React
  product: Product
  variant: ProductVariant | null
  quantity: number
  unit_price: number // admin-overridable
}

interface CouponState {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  minimum_order_value: number | null
  times_used: number
  usage_limit: number | null
}

// ---------------------------------------------------------------------------
// Constants — sourced from real schema values
// ---------------------------------------------------------------------------

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "cash", label: "Cash" },
  { value: "manual", label: "Manual" },
  { value: "other", label: "Other" },
]

const SUPPLIER_STATUSES = [
  { value: "", label: "Not Started" },
  { value: "unprocessed", label: "Unprocessed" },
  { value: "preparing", label: "Preparing" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
]

// ---------------------------------------------------------------------------
// Small shared UI primitives
// ---------------------------------------------------------------------------

const sectionCls =
  "rounded-2xl border border-white/8 bg-white/[0.015] overflow-hidden"
const labelCls =
  "block font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/30 mb-1.5"
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/20 transition-colors"
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 tracking-wide focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/6">
      <Icon className="w-3.5 h-3.5 text-white/30" strokeWidth={1.5} />
      <span className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">{title}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const supabase = createBrowserClient()

  // ── Customer ──────────────────────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerResults, setCustomerResults] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing")

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  // ── Products ──────────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("")
  const [productResults, setProductResults] = useState<Product[]>([])
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([])

  // ── Pricing ───────────────────────────────────────────────────────────────
  const [shippingAmount, setShippingAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)

  // Coupon
  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  // Custom discount
  const [customDiscountType, setCustomDiscountType] = useState<"percentage" | "fixed">("fixed")
  const [customDiscountValue, setCustomDiscountValue] = useState("")

  // Credits
  const [creditsToApply, setCreditsToApply] = useState(0)

  // ── Payment / Status ──────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [orderStatus, setOrderStatus] = useState("pending")
  const [supplierStatus, setSupplierStatus] = useState("")

  // ── Notes ─────────────────────────────────────────────────────────────────
  const [internalNotes, setInternalNotes] = useState("")

  // ── Submission ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  const productSearchRef = useRef<HTMLDivElement>(null)

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    setCustomerSearch("")
    setCustomerResults([])
    setSelectedProfile(null)
    setCustomerMode("existing")
    setCustomer({ firstName: "", lastName: "", email: "", phone: "", address: "", apartment: "", city: "", state: "", postalCode: "", country: "" })
    setProductSearch("")
    setProductResults([])
    setShowProductSearch(false)
    setLineItems([])
    setShippingAmount(0)
    setTaxAmount(0)
    setCouponCode("")
    setCouponError("")
    setAppliedCoupon(null)
    setCustomDiscountType("fixed")
    setCustomDiscountValue("")
    setCreditsToApply(0)
    setPaymentMethod("bank_transfer")
    setOrderStatus("pending")
    setSupplierStatus("")
    setInternalNotes("")
    setErrors({})
    setSubmitError("")
  }, [isOpen])

  // ── Customer search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!customerSearch.trim() || customerSearch.length < 2) {
      setCustomerResults([])
      return
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, first_name, last_name, phone, address_street, address_city, address_state, address_zip, address_country, credits")
        .or(`email.ilike.%${customerSearch}%,full_name.ilike.%${customerSearch}%`)
        .limit(8)
      setCustomerResults(data ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [customerSearch])

  const selectProfile = (profile: Profile) => {
    setSelectedProfile(profile)
    setCustomer({
      firstName: profile.first_name ?? profile.full_name?.split(" ")[0] ?? "",
      lastName: profile.last_name ?? profile.full_name?.split(" ").slice(1).join(" ") ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      address: profile.address_street ?? "",
      apartment: "",
      city: profile.address_city ?? "",
      state: profile.address_state ?? "",
      postalCode: profile.address_zip ?? "",
      country: profile.address_country ?? "",
    })
    setCustomerResults([])
    setCustomerSearch(profile.email ?? "")
  }

  // ── Product search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productSearch.trim() || productSearch.length < 2) {
      setProductResults([])
      return
    }
    const t = setTimeout(async () => {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, price, discounted_price, image_folder, slug")
        .ilike("name", `%${productSearch}%`)
        .eq("status", "live")
        .limit(10)

      if (!products || products.length === 0) {
        setProductResults([])
        return
      }

      const productIds = products.map((p) => p.id)

      const [{ data: variants }, { data: images }] = await Promise.all([
        supabase
          .from("product_variants")
          .select("id, size, color, sku, stock_quantity, price_adjustment, product_id")
          .in("product_id", productIds),
        supabase
          .from("product_images")
          .select("product_id, url, display_order")
          .in("product_id", productIds)
          .order("display_order", { ascending: true }),
      ])

      const imageMap = new Map<string, string>()
      images?.forEach((img) => {
        if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, img.url)
      })

      const enriched: Product[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        discounted_price: p.discounted_price ?? null,
        image_folder: p.image_folder ?? null,
        slug: p.slug,
        variants: (variants ?? []).filter((v: any) => v.product_id === p.id),
        image_url: imageMap.get(p.id) ?? null,
      }))

      setProductResults(enriched)
    }, 300)
    return () => clearTimeout(t)
  }, [productSearch])

  const addProduct = (product: Product) => {
    // If product has no variants just add a line item directly
    const defaultVariant = product.variants.length === 1 ? product.variants[0] : null
    const effectivePrice = product.discounted_price ?? product.price
    const newItem: LineItem = {
      key: `${product.id}-${Date.now()}`,
      product,
      variant: defaultVariant,
      quantity: 1,
      unit_price: effectivePrice,
    }
    setLineItems((prev) => [...prev, newItem])
    setProductSearch("")
    setProductResults([])
    setShowProductSearch(false)
  }

  const updateLineItem = (key: string, patch: Partial<LineItem>) => {
    setLineItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  const removeLineItem = (key: string) => {
    setLineItems((prev) => prev.filter((item) => item.key !== key))
  }

  const duplicateLineItem = (key: string) => {
    const item = lineItems.find((i) => i.key === key)
    if (!item) return
    setLineItems((prev) => [...prev, { ...item, key: `${item.product.id}-${Date.now()}` }])
  }

  // ── Calculations (live, mirror checkout) ──────────────────────────────────
  const subtotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0

  const customDiscountNum = Number.parseFloat(customDiscountValue) || 0
  const customDiscount =
    customDiscountType === "percentage" ? (subtotal * customDiscountNum) / 100 : customDiscountNum

  const creditsDiscount = creditsToApply * 0.89

  const totalDiscount = couponDiscount + customDiscount + creditsDiscount
  const total = Math.max(0, subtotal - totalDiscount + shippingAmount + taxAmount)

  // ── Coupon validation ─────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsValidatingCoupon(true)
    setCouponError("")
    const result = await validateCoupon(couponCode.trim(), subtotal, customer.email)
    setIsValidatingCoupon(false)
    if (!result.valid) {
      setCouponError(result.error ?? "Invalid coupon")
      return
    }
    setAppliedCoupon(result.coupon)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!customer.email) errs.email = "Email is required"
    if (!customer.firstName) errs.firstName = "First name is required"
    if (!customer.lastName) errs.lastName = "Last name is required"
    if (!customer.address) errs.address = "Address is required"
    if (!customer.city) errs.city = "City is required"
    if (!customer.postalCode) errs.postalCode = "Postal code is required"
    if (!customer.country) errs.country = "Country is required"
    if (lineItems.length === 0) errs.items = "At least one product is required"
    lineItems.forEach((item) => {
      if (item.product.variants.length > 0 && !item.variant) {
        errs[`variant-${item.key}`] = "Select a variant for " + item.product.name
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError("")
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const result = await createOrderAction({
        customer_email: customer.email,
        customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
        customer_phone: customer.phone || null,
        user_id: selectedProfile?.id ?? null,

        shipping_address: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          apartment: customer.apartment,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          country: customer.country,
        },

        items: lineItems.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id ?? null,
          quantity: item.quantity,
          price: item.unit_price,
        })),

        subtotal_amount: subtotal,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: totalDiscount,
        total_amount: total,
        total: total,

        coupon_code: appliedCoupon?.code ?? null,
        coupon_id: appliedCoupon?.id ?? null,
        coupon_discount: couponDiscount,

        credits_applied: creditsToApply,

        payment_method: paymentMethod,
        status: orderStatus,
        supplier_status: supplierStatus || null,
        internal_notes: internalNotes || null,
      })

      if (!result.success) {
        setSubmitError(result.error ?? "Failed to create order")
        setIsSubmitting(false)
        return
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error("[v0] CreateOrderModal submit error:", err)
      setSubmitError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const maxCreditsAllowed = selectedProfile
    ? Math.min(selectedProfile.credits, Math.floor(subtotal / 0.89))
    : 0

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal container */}
      <div
        className="relative flex flex-col w-full max-w-[1100px] max-h-[90vh] mx-4 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden"
        style={{ animation: "fadeSlideUp 0.2s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/8 flex-shrink-0">
          <div>
            <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-0.5">Manual</p>
            <h2 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90">Create Order</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-7 space-y-5">

          {/* ═══════════════════════════════════════════════════════════════
              1. CUSTOMER
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={User} title="Customer" />
            <div className="p-5 space-y-5">
              {/* Mode toggle */}
              <div className="flex gap-2">
                {(["existing", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCustomerMode(mode)}
                    className={`px-4 py-2 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase transition-all ${
                      customerMode === mode
                        ? "bg-white/8 text-white/90 border border-white/15"
                        : "text-white/35 border border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    {mode === "existing" ? "Existing Customer" : "New Customer"}
                  </button>
                ))}
              </div>

              {/* Search existing */}
              {customerMode === "existing" && (
                <div className="relative">
                  <label className={labelCls}>Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input
                      type="text"
                      placeholder="Search by email or name..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                  {customerResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden">
                      {customerResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectProfile(p)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                            <span className="font-sans text-[10px] text-white/50">
                              {(p.full_name ?? p.email ?? "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-sans text-[11px] text-white/80">{p.full_name ?? "—"}</p>
                            <p className="font-sans text-[10px] text-white/35">{p.email}</p>
                          </div>
                          {selectedProfile?.id === p.id && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedProfile && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="font-sans text-[10px] text-emerald-400">
                        {selectedProfile.full_name ?? selectedProfile.email} selected
                        {selectedProfile.credits > 0 && (
                          <span className="ml-2 text-white/40">· {selectedProfile.credits} credits available</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Customer fields */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>First Name *</label>
                  <input
                    className={`${inputCls} ${errors.firstName ? "border-red-500/40" : ""}`}
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    placeholder="Jean"
                  />
                  {errors.firstName && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Last Name *</label>
                  <input
                    className={`${inputCls} ${errors.lastName ? "border-red-500/40" : ""}`}
                    value={customer.lastName}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    placeholder="Dupont"
                  />
                  {errors.lastName && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.lastName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    type="email"
                    className={`${inputCls} ${errors.email ? "border-red-500/40" : ""}`}
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="jean@example.com"
                  />
                  {errors.email && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+49 170 000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className={labelCls}>Address *</label>
                  <input
                    className={`${inputCls} ${errors.address ? "border-red-500/40" : ""}`}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Musterstraße 1"
                  />
                  {errors.address && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.address}</p>}
                </div>
                <div>
                  <label className={labelCls}>Apartment / Suite</label>
                  <input
                    className={inputCls}
                    value={customer.apartment}
                    onChange={(e) => setCustomer({ ...customer, apartment: e.target.value })}
                    placeholder="Apt 4B"
                  />
                </div>
                <div>
                  <label className={labelCls}>Postal Code *</label>
                  <input
                    className={`${inputCls} ${errors.postalCode ? "border-red-500/40" : ""}`}
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    placeholder="10115"
                  />
                  {errors.postalCode && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input
                    className={`${inputCls} ${errors.city ? "border-red-500/40" : ""}`}
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="Berlin"
                  />
                  {errors.city && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.city}</p>}
                </div>
                <div>
                  <label className={labelCls}>State / Region</label>
                  <input
                    className={inputCls}
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    placeholder="Bayern"
                  />
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <div className="relative">
                    <select
                      className={`${selectCls} ${errors.country ? "border-red-500/40" : ""}`}
                      value={customer.country}
                      onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  </div>
                  {errors.country && <p className="mt-1 font-sans text-[10px] text-red-400">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              2. PRODUCTS
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={Package} title="Products" />
            <div className="p-5 space-y-3">
              {errors.items && (
                <p className="font-sans text-[10px] text-red-400">{errors.items}</p>
              )}

              {/* Line items */}
              {lineItems.length > 0 && (
                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/6"
                    >
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-white/15" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                        <div className="min-w-0">
                          <p className="font-sans text-[11px] font-medium text-white/80 truncate">{item.product.name}</p>

                          {/* Variant selector */}
                          {item.product.variants.length > 0 ? (
                            <div className="mt-1.5">
                              <div className="relative">
                                <select
                                  className="w-full max-w-[260px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/8 font-sans text-[10px] text-white/60 focus:outline-none focus:border-white/15 appearance-none cursor-pointer"
                                  value={item.variant?.id ?? ""}
                                  onChange={(e) => {
                                    const v = item.product.variants.find((x) => x.id === e.target.value) ?? null
                                    updateLineItem(item.key, { variant: v })
                                    if (v && errors[`variant-${item.key}`]) {
                                      setErrors((prev) => {
                                        const next = { ...prev }
                                        delete next[`variant-${item.key}`]
                                        return next
                                      })
                                    }
                                  }}
                                >
                                  <option value="">Select variant...</option>
                                  {item.product.variants.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {[v.size, v.color].filter(Boolean).join(" · ")}
                                      {v.stock_quantity !== null && ` (${v.stock_quantity} left)`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {errors[`variant-${item.key}`] && (
                                <p className="mt-0.5 font-sans text-[10px] text-red-400">{errors[`variant-${item.key}`]}</p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-0.5 font-sans text-[10px] text-white/30">No variants</p>
                          )}
                        </div>

                        {/* Unit price override */}
                        <div className="text-right">
                          <p className="font-sans text-[9px] tracking-widest uppercase text-white/25 mb-1">Unit Price</p>
                          <div className="flex items-center gap-1">
                            <span className="font-sans text-[10px] text-white/30">EUR</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateLineItem(item.key, {
                                  unit_price: Math.max(0, Number.parseFloat(e.target.value) || 0),
                                })
                              }
                              className="w-20 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/8 font-sans text-[11px] text-white/80 text-right focus:outline-none focus:border-white/20 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="text-right">
                          <p className="font-sans text-[9px] tracking-widest uppercase text-white/25 mb-1">Qty</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateLineItem(item.key, { quantity: Math.max(1, item.quantity - 1) })
                              }
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-sans text-[11px] text-white/80">{item.quantity}</span>
                            <button
                              onClick={() => updateLineItem(item.key, { quantity: item.quantity + 1 })}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal + actions */}
                        <div className="text-right">
                          <p className="font-sans text-[9px] tracking-widest uppercase text-white/25 mb-1">Subtotal</p>
                          <p className="font-sans text-[12px] font-medium text-white/80">
                            EUR {(item.unit_price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex justify-end gap-1 mt-2">
                            <button
                              onClick={() => duplicateLineItem(item.key)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/35 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeLineItem(item.key)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/8 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product search */}
              <div ref={productSearchRef} className="relative">
                <button
                  onClick={() => setShowProductSearch((v) => !v)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/12 hover:border-white/20 text-white/35 hover:text-white/60 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase">Add Product</span>
                </button>
                {showProductSearch && (
                  <div className="mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                    {productResults.length > 0 && (
                      <div className="mt-1 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                        {productResults.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => addProduct(p)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                          >
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-white/15 m-auto mt-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-[11px] text-white/80 truncate">{p.name}</p>
                              <p className="font-sans text-[10px] text-white/35">
                                EUR {(p.discounted_price ?? p.price).toFixed(2)}
                                {p.variants.length > 0 && ` · ${p.variants.length} variant${p.variants.length > 1 ? "s" : ""}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {productSearch.length >= 2 && productResults.length === 0 && (
                      <p className="mt-2 font-sans text-[10px] text-white/25 text-center py-3">No products found</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              3. PRICING
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={Tag} title="Pricing & Discounts" />
            <div className="p-5 space-y-5">

              {/* Shipping & Tax */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Shipping (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputCls}
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tax (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputCls}
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className={labelCls}>Coupon Code</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                    <div>
                      <span className="font-sans text-[11px] font-medium text-emerald-400">{appliedCoupon.code}</span>
                      <span className="ml-2 font-sans text-[10px] text-white/40">
                        {appliedCoupon.discount_type === "percentage"
                          ? `${appliedCoupon.discount_value}% off`
                          : `EUR ${appliedCoupon.discount_value.toFixed(2)} off`}
                        {" "}→ −EUR {couponDiscount.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1 uppercase placeholder:normal-case`}
                      placeholder="e.g. SUMMER20"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError("") }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all disabled:opacity-40"
                    >
                      {isValidatingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-1.5 font-sans text-[10px] text-red-400">{couponError}</p>}
              </div>

              {/* Custom Discount */}
              <div>
                <label className={labelCls}>Custom Discount</label>
                <div className="flex gap-2">
                  <div className="flex rounded-xl overflow-hidden border border-white/8">
                    {(["fixed", "percentage"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCustomDiscountType(type)}
                        className={`px-4 py-2.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase transition-all ${
                          customDiscountType === type
                            ? "bg-white/[0.07] text-white/80"
                            : "text-white/30 hover:bg-white/[0.03]"
                        }`}
                      >
                        {type === "fixed" ? "EUR" : "%"}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${inputCls} flex-1`}
                    placeholder={customDiscountType === "fixed" ? "0.00" : "0"}
                    value={customDiscountValue}
                    onChange={(e) => setCustomDiscountValue(e.target.value)}
                  />
                  {customDiscount > 0 && (
                    <div className="flex items-center px-3 font-sans text-[11px] text-white/40">
                      −EUR {customDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Credits */}
              {selectedProfile && selectedProfile.credits > 0 && (
                <div>
                  <label className={labelCls}>
                    Apply Credits ({selectedProfile.credits} available · 1 credit = EUR 0.89)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max={maxCreditsAllowed}
                      className={`${inputCls} w-32`}
                      value={creditsToApply}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(Number.parseInt(e.target.value) || 0, maxCreditsAllowed))
                        setCreditsToApply(v)
                      }}
                    />
                    <button
                      onClick={() => setCreditsToApply(maxCreditsAllowed)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 font-sans text-[10px] tracking-[0.12em] uppercase text-white/45 hover:text-white/70 transition-all"
                    >
                      Max
                    </button>
                    {creditsDiscount > 0 && (
                      <span className="font-sans text-[11px] text-white/40">−EUR {creditsDiscount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Live Totals */}
              <div className="rounded-xl bg-white/[0.025] border border-white/6 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-sans text-[10px] text-white/40 tracking-wide">Subtotal</span>
                  <span className="font-sans text-[11px] text-white/60">EUR {subtotal.toFixed(2)}</span>
                </div>
                {shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] text-white/40 tracking-wide">Shipping</span>
                    <span className="font-sans text-[11px] text-white/60">EUR {shippingAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] text-white/40 tracking-wide">Tax</span>
                    <span className="font-sans text-[11px] text-white/60">EUR {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] text-white/40 tracking-wide">Discount</span>
                    <span className="font-sans text-[11px] text-emerald-400">−EUR {totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/6 flex justify-between">
                  <span className="font-sans text-[11px] font-medium tracking-wide text-white/70">Total</span>
                  <span className="font-sans text-[14px] font-medium text-white/90">EUR {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              4. PAYMENT & STATUS
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={CreditCard} title="Payment & Fulfillment" />
            <div className="p-5 grid grid-cols-3 gap-3.5">
              <div>
                <label className={labelCls}>Payment Method</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Order Status</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Fulfillment</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={supplierStatus}
                    onChange={(e) => setSupplierStatus(e.target.value)}
                  >
                    {SUPPLIER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              5. NOTES
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={FileText} title="Internal Notes" />
            <div className="p-5">
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Admin-only notes about this order..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              6. TIMELINE PREVIEW
          ═══════════════════════════════════════════════════════════════ */}
          <div className={sectionCls}>
            <SectionHeader icon={ChevronDown} title="Timeline Preview" />
            <div className="p-5">
              <ol className="space-y-2">
                {[
                  { label: "Order created (Manual Admin Order)", active: true },
                  { label: `Payment: ${PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod}`, active: true },
                  { label: `Status: ${ORDER_STATUSES.find((s) => s.value === orderStatus)?.label ?? orderStatus}`, active: true },
                  supplierStatus
                    ? { label: `Fulfillment: ${SUPPLIER_STATUSES.find((s) => s.value === supplierStatus)?.label ?? supplierStatus}`, active: true }
                    : null,
                  appliedCoupon
                    ? { label: `Coupon applied: ${appliedCoupon.code}`, active: true }
                    : null,
                  internalNotes
                    ? { label: "Internal note attached", active: false }
                    : null,
                ]
                  .filter(Boolean)
                  .map((event, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${event!.active ? "bg-white/25" : "bg-white/10"}`} />
                      <span className={`font-sans text-[10px] tracking-wide ${event!.active ? "text-white/50" : "text-white/25"}`}>
                        {event!.label}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>

        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-7 py-5 border-t border-white/8 bg-[#111111]">
          <div className="flex-1">
            {submitError && (
              <p className="font-sans text-[11px] text-red-400">{submitError}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Summary */}
            {lineItems.length > 0 && (
              <div className="mr-4 text-right">
                <p className="font-sans text-[9px] tracking-widest uppercase text-white/25">
                  {lineItems.length} item{lineItems.length > 1 ? "s" : ""}
                </p>
                <p className="font-sans text-[13px] font-medium text-white/70">EUR {total.toFixed(2)}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-white/40 hover:text-white/60 border border-transparent hover:border-white/8 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase bg-white text-black hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
