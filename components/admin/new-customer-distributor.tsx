"use client"

import { useEffect, useRef, useState } from "react"
import { X, Loader2 } from "lucide-react"
import gsap from "gsap"
import { createBrowserClient } from "@/lib/supabase/client"

interface NewCustomerDistributorProps {
  isOpen: boolean
  onClose: () => void
  distributorId: string
  onCustomerCreated: () => void
}

const COUNTRIES = [
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan",
  "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria",
  "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
  "Finland", "France", "Georgia", "Germany", "Greece", "Hungary",
  "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo",
  "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta",
  "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino",
  "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland",
  "Turkey", "Ukraine", "United Kingdom", "United States", "Canada",
  "Australia", "New Zealand", "Japan", "South Korea", "China",
  "Singapore", "United Arab Emirates", "Saudi Arabia", "Other",
]

const INITIAL_FORM = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  street: "",
  city: "",
  postal_code: "",
  country: "",
  telegram_username: "",
  instagram_username: "",
  snapchat_username: "",
}

export function NewCustomerDistributor({
  isOpen,
  onClose,
  distributorId,
  onCustomerCreated,
}: NewCustomerDistributorProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<typeof INITIAL_FORM>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // GSAP animation
  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return

    const panel = panelRef.current
    const overlay = overlayRef.current

    if (isOpen) {
      panel.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"
      document.body.style.overflow = "hidden"

      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      )
      gsap.fromTo(
        panel,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power3.out" }
      )
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.25, ease: "power2.in" })
      gsap.to(panel, {
        x: "100%",
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => {
          panel.style.pointerEvents = "none"
          overlay.style.pointerEvents = "none"
          document.body.style.overflow = ""
        },
      })
    }
  }, [isOpen])

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<typeof INITIAL_FORM> = {}

    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email address"

    if (!form.first_name.trim()) newErrors.first_name = "First name is required"
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSuccess(false)

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient()

      const { error } = await supabase.from("distributor_customers").insert({
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
        street: form.street.trim() || null,
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country: form.country || null,
        telegram_username: form.telegram_username.trim() || null,
        instagram_username: form.instagram_username.trim() || null,
        snapchat_username: form.snapchat_username.trim() || null,
        distributor: distributorId,
      })

      if (error) {
        setSubmitError(error.message)
        return
      }

      setSuccess(true)
      setForm(INITIAL_FORM)
      setErrors({})
      onCustomerCreated()

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setForm(INITIAL_FORM)
    setErrors({})
    setSubmitError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/30 z-40"
        style={{ opacity: 0, pointerEvents: "none" }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
        style={{ transform: "translateX(100%)", pointerEvents: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-medium tracking-widest uppercase text-zinc-900">New Customer</h2>
            <p className="text-xs text-zinc-500 tracking-wide mt-0.5">Add a new customer to your account</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors text-zinc-600"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="new-customer-form" noValidate>

            {/* Section: Identity */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 mb-3">Identity</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First Name"
                    required
                    error={errors.first_name}
                  >
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                      placeholder="John"
                      className={inputCls(!!errors.first_name)}
                    />
                  </Field>
                  <Field
                    label="Last Name"
                    required
                    error={errors.last_name}
                  >
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                      placeholder="Doe"
                      className={inputCls(!!errors.last_name)}
                    />
                  </Field>
                </div>

                <Field label="Email" required error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john.doe@email.com"
                    className={inputCls(!!errors.email)}
                  />
                </Field>

                <Field label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={inputCls(false)}
                  />
                </Field>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100" />

            {/* Section: Address */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 mb-3">Address</p>
              <div className="space-y-4">
                <Field label="Street" error={errors.street}>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    placeholder="123 Main Street"
                    className={inputCls(false)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" error={errors.city}>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="New York"
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Postal Code" error={errors.postal_code}>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) => handleChange("postal_code", e.target.value)}
                      placeholder="10001"
                      className={inputCls(false)}
                    />
                  </Field>
                </div>

                <Field label="Country" error={errors.country}>
                  <select
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className={`${inputCls(false)} appearance-none bg-white cursor-pointer`}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100" />

            {/* Section: Socials */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-zinc-400 mb-3">Socials</p>
              <div className="space-y-4">
                <Field label="Telegram Username">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">@</span>
                    <input
                      type="text"
                      value={form.telegram_username}
                      onChange={(e) => handleChange("telegram_username", e.target.value)}
                      placeholder="username"
                      className={`${inputCls(false)} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Instagram Username">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">@</span>
                    <input
                      type="text"
                      value={form.instagram_username}
                      onChange={(e) => handleChange("instagram_username", e.target.value)}
                      placeholder="username"
                      className={`${inputCls(false)} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Snapchat Username">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">@</span>
                    <input
                      type="text"
                      value={form.snapchat_username}
                      onChange={(e) => handleChange("snapchat_username", e.target.value)}
                      placeholder="username"
                      className={`${inputCls(false)} pl-8`}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs text-red-600">{submitError}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-xs text-green-600 tracking-wide">Customer created successfully.</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-200 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border border-zinc-200 py-3 text-sm font-medium tracking-wide uppercase text-zinc-700 hover:border-zinc-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-customer-form"
            disabled={isSubmitting}
            className="flex-1 bg-black text-white py-3 text-sm font-medium tracking-wide uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Customer"
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// Helper components
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium tracking-wide uppercase text-zinc-600">
        {label}
        {required && <span className="text-zinc-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return [
    "w-full px-4 py-2.5 border text-sm bg-white text-zinc-900",
    "placeholder:text-zinc-400 focus:outline-none transition-colors",
    hasError
      ? "border-red-300 focus:border-red-500"
      : "border-zinc-200 focus:border-black",
  ].join(" ")
}
