"use client"

import { useState } from "react"
import Link from "next/link"
import { submitDistributorApplication } from "@/app/actions/distributor-application"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ───────────────────────────────────────────────────────────────────

type FormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  company: string
  region: string
  website: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ number, label }: { number: string; label: string }) {
  return (
    <p className="text-[10px] tracking-[0.25em] uppercase font-light text-white/30">
      {number} — {label}
    </p>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-[11px] tracking-wide text-[#C0392B]/80">{message}</p>
  )
}

function PremiumInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: {
  id: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  autoComplete?: string
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={[
          "w-full rounded-[8px] border px-4 py-3 text-[13px] font-light tracking-wide",
          "bg-[#1C1C1C] text-white/90 placeholder:text-white/20",
          "outline-none transition-all duration-200",
          "focus:border-[#D6C7A1] focus:ring-1 focus:ring-[#D6C7A1]/20",
          error
            ? "border-[#C0392B]/50"
            : "border-[#2A2A2A] hover:border-white/10",
        ].join(" ")}
      />
      <FieldError message={error} />
    </div>
  )
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.firstName.trim()) errors.firstName = "Required."
  if (!values.lastName.trim()) errors.lastName = "Required."
  if (!values.email.trim()) {
    errors.email = "Required."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email address."
  }
  if (!values.password.trim()) {
    errors.password = "Required."
  } else if (values.password.length < 8) {
    errors.password = "Minimum 8 characters."
  }
  if (!values.company.trim()) errors.company = "Required."
  if (!values.region) errors.region = "Required."
  return errors
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    region: "",
    website: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (field: keyof FormValues) => (v: string) => {
    setValues((prev) => ({ ...prev, [field]: v }))
    if (touched[field]) {
      const next = { ...values, [field]: v }
      const errs = validate(next)
      setErrors((prev) => ({ ...prev, [field]: errs[field] }))
    }
  }

  const blur = (field: keyof FormValues) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errs = validate(values)
    setErrors((prev) => ({ ...prev, [field]: errs[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = Object.keys(values).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormValues, boolean>
    )
    setTouched(allTouched)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setServerError(null)

    const formData = new FormData()
    formData.set("firstName", values.firstName)
    formData.set("lastName", values.lastName)
    formData.set("email", values.email)
    formData.set("password", values.password)
    formData.set("companyName", values.company)
    formData.set("operatingRegion", values.region)
    formData.set("website", values.website)

    const result = await submitDistributorApplication(formData)

    setSubmitting(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      setServerError(result.error ?? "Something went wrong. Please try again.")
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0D0D0D" }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(13,13,13,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          className="text-[11px] font-light tracking-[0.3em] uppercase text-white"
        >
          SAINT YVE
        </Link>
        <Link
          href="/"
          className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
        >
          Back to Home
        </Link>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-col items-center flex-1 px-4 pt-16 pb-24 md:pt-24">

        {/* Subtle spotlight behind hero */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-[0.07]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(214,199,161,1) 0%, transparent 70%)",
          }}
        />

        {/* ── Hero ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Status pill */}
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-white/70"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]"
              style={{ boxShadow: "0 0 4px rgba(214,199,161,0.6)" }}
            />
            PARTNER APPLICATIONS OPEN
          </div>

          <h1 className="text-[28px] md:text-[40px] font-light tracking-[0.12em] uppercase text-white leading-tight mb-4 text-balance">
            Private Distribution Access
          </h1>
          <p className="text-[13px] md:text-[14px] font-light tracking-[0.08em] text-white/40 max-w-md text-balance">
            Request entry to the Saint Yve network.
          </p>

          {/* Barrier layer */}
          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/25">
              Applications are manually reviewed.
            </p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/25">
              Acceptance rate: {"<"} 18%
            </p>
          </div>
        </motion.div>

        {/* ── Form Card ── */}
        <motion.div
          className="relative z-10 w-full max-w-[660px]"
          initial={{ opacity: 0, scale: 0.975, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-full rounded-2xl p-8 md:p-10"
            style={{
              backgroundColor: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.5)",
            }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center py-10 gap-6"
                >
                  <div
                    className="h-px w-10 mb-2"
                    style={{ backgroundColor: "#D6C7A1" }}
                  />
                  <h2
                    className="text-[16px] tracking-[0.18em] uppercase font-light text-white"
                  >
                    Application Received
                  </h2>
                  <p className="text-[12px] font-light tracking-[0.06em] text-white/35 max-w-xs text-balance leading-relaxed">
                    If approved, you&apos;ll receive next steps via email.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 text-[11px] tracking-[0.22em] uppercase text-white/40 hover:text-white/70 transition-colors duration-200"
                  >
                    Return Home
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  noValidate
                >
                  {/* Section 01 — IDENTITY */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                  >
                    <SectionTitle number="01" label="Identity" />
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                        >
                          First Name
                        </Label>
                        <PremiumInput
                          id="firstName"
                          placeholder="First name"
                          value={values.firstName}
                          onChange={set("firstName")}
                          onBlur={blur("firstName")}
                          error={errors.firstName}
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                        >
                          Last Name
                        </Label>
                        <PremiumInput
                          id="lastName"
                          placeholder="Last name"
                          value={values.lastName}
                          onChange={set("lastName")}
                          onBlur={blur("lastName")}
                          error={errors.lastName}
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label
                        htmlFor="email"
                        className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                      >
                        Email Address
                      </Label>
                      <PremiumInput
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={set("email")}
                        onBlur={blur("email")}
                        error={errors.email}
                        autoComplete="email"
                      />
                    </div>
                    <div className="mt-4">
                      <Label
                        htmlFor="password"
                        className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                      >
                        Password
                      </Label>
                      <PremiumInput
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={values.password}
                        onChange={set("password")}
                        onBlur={blur("password")}
                        error={errors.password}
                        autoComplete="new-password"
                      />
                    </div>
                  </motion.div>

                  {/* Separator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="my-8"
                  >
                    <Separator
                      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    />
                  </motion.div>

                  {/* Section 02 — ORGANIZATION */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <SectionTitle number="02" label="Organization" />
                    <div className="mt-5">
                      <Label
                        htmlFor="company"
                        className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                      >
                        Company Name
                      </Label>
                      <PremiumInput
                        id="company"
                        placeholder="Your company"
                        value={values.company}
                        onChange={set("company")}
                        onBlur={blur("company")}
                        error={errors.company}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="mt-4">
                      <Label
                        htmlFor="region"
                        className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                      >
                        Operating Region
                      </Label>
                      <Select
                        value={values.region}
                        onValueChange={(v) => {
                          set("region")(v)
                          setTouched((prev) => ({ ...prev, region: true }))
                        }}
                      >
                        <SelectTrigger
                          id="region"
                          className="w-full rounded-[8px] border border-[#2A2A2A] bg-[#1C1C1C] px-4 py-3 text-[13px] font-light tracking-wide text-white/90 outline-none transition-all duration-200 hover:border-white/10 focus:border-[#D6C7A1] focus:ring-1 focus:ring-[#D6C7A1]/20 h-auto"
                          style={{
                            borderColor: errors.region ? "rgba(192,57,43,0.5)" : undefined,
                          }}
                        >
                          <SelectValue
                            placeholder={
                              <span className="text-white/20">Select region</span>
                            }
                          />
                        </SelectTrigger>
                        <SelectContent
                          className="rounded-[8px] border border-[#2A2A2A] bg-[#1C1C1C] text-white/80 shadow-2xl"
                        >
                          {[
                            "North America",
                            "Europe",
                            "UK",
                            "Middle East",
                            "Asia-Pacific",
                            "Latin America",
                            "Africa",
                            "Global",
                          ].map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              className="text-[12px] tracking-wide font-light cursor-pointer focus:bg-white/5 focus:text-white"
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.region} />
                    </div>
                    <div className="mt-4">
                      <Label
                        htmlFor="website"
                        className="text-[10px] tracking-[0.18em] uppercase text-white/35 font-light block mb-2"
                      >
                        Website / Store URL{" "}
                        <span className="text-white/15 normal-case tracking-normal">
                          — optional
                        </span>
                      </Label>
                      <PremiumInput
                        id="website"
                        type="url"
                        placeholder="https://yourstore.com"
                        value={values.website}
                        onChange={set("website")}
                        autoComplete="url"
                      />
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-10 flex flex-col items-center gap-3"
                  >
                    {serverError && (
                      <p className="w-full text-center text-[11px] tracking-wide text-[#C0392B]/80 mb-1">
                        {serverError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative w-full overflow-hidden rounded-[8px] border px-6 py-3.5 text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#111111",
                        borderColor: "rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget
                        el.style.transform = "translateY(-2px)"
                        el.style.borderColor = "rgba(214,199,161,0.45)"
                        el.style.backgroundColor = "#1a1a1a"
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget
                        el.style.transform = "translateY(0)"
                        el.style.borderColor = "rgba(255,255,255,0.10)"
                        el.style.backgroundColor = "#111111"
                      }}
                    >
                      {submitting ? "PROCESSING…" : "REQUEST ACCESS"}
                    </button>

                    <p className="text-[10px] tracking-[0.12em] text-white/20 font-light text-center">
                      We respond within 48–72 business hours if approved.
                    </p>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footnote */}
          <p className="mt-6 text-center text-[10px] tracking-[0.15em] uppercase text-white/18 font-light">
            All submissions are confidential. False information results in permanent exclusion.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
