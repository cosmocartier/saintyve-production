"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

// ─── Micro-components ──────────────────────────────────────────────────────

function StatusPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]/70" aria-hidden />
      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
        {label}
      </span>
    </div>
  )
}

function SectionTitle({ index, label }: { index: string; label: string }) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
        {index} — {label}
      </p>
      <Separator className="bg-white/8" />
    </div>
  )
}

function PremiumInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required,
}: {
  id: string
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/50"
      >
        {label}
        {required && <span className="ml-0.5 text-[#D6C7A1]/60">*</span>}
      </Label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={[
          "w-full rounded-lg border px-4 py-3.5 font-sans text-sm text-white/90 outline-none transition-all duration-200",
          "bg-[#1C1C1C] placeholder:text-white/25",
          "focus:border-[#D6C7A1]/60 focus:shadow-[0_0_0_2px_rgba(214,199,161,0.08)]",
          error
            ? "border-red-800/60"
            : "border-[#2A2A2A] hover:border-white/12",
        ].join(" ")}
      />
    </div>
  )
}

// ─── Enter Portal Button ────────────────────────────────────────────────────

function EnterPortalButton({ loading }: { loading: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { y: -2 } : undefined}
      whileTap={!loading ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={[
        "group relative w-full overflow-hidden rounded-lg border border-white/10 px-6 py-4",
        "font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-white/80",
        "bg-[#111111] transition-all duration-200",
        "hover:border-[#D6C7A1]/25 hover:bg-[#181818] hover:text-white/95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6C7A1]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      <span className="relative z-10">
        {loading ? "VERIFYING…" : "ENTER PORTAL"}
      </span>
      <span
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(214,199,161,0.15)" }}
        aria-hidden
      />
    </motion.button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (!profile || (profile.role !== "admin" && profile.role !== "supplier")) {
        await supabase.auth.signOut()
        throw new Error("Unauthorized: Admin or Supplier access required")
      }

      setSuccess(true)

      setTimeout(() => {
        if (profile.role === "supplier") {
          router.push("/admin/supplier")
        } else {
          router.push("/admin/dashboard")
        }
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
        aria-hidden
      />

      {/* ── Top Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/6">
        <div
          className="relative px-6 py-4"
          style={{ backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              href="/"
              className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-white/90 transition-colors hover:text-white"
            >
              DESIGNERDRIP
            </Link>
            <Link
              href="/"
              className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-white/60"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 pb-24 pt-20">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-col items-center gap-6 text-center"
        >
          {/* Faint spotlight */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: "600px",
              height: "340px",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(214,199,161,0.055) 0%, transparent 70%)",
            }}
            aria-hidden
          />

          <StatusPill label="Admin Portal" />

          <div className="space-y-2">
            <h1 className="font-sans text-[28px] font-light uppercase tracking-[0.12em] text-white sm:text-[36px]">
              Admin Login
            </h1>
            <p className="font-sans text-[13px] font-light tracking-wide text-white/40">
              Authorized personnel only.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/25">
              This portal is restricted.
            </p>
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-white/25">
              Unauthorized access is monitored.
            </p>
          </div>
        </motion.div>

        {/* ── Main Card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.975, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[600px]"
        >
          <div
            className="rounded-2xl border border-white/8 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] sm:p-10"
            style={{ backgroundColor: "#151515" }}
          >
            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success State ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#D6C7A1]/20 bg-[#D6C7A1]/5">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="text-[#D6C7A1]/70"
                      aria-hidden
                    >
                      <path
                        d="M4 10l4.5 4.5L16 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#D6C7A1]/80">
                    Access Granted
                  </p>
                  <p className="font-sans text-[13px] font-light text-white/35">
                    Redirecting…
                  </p>
                </motion.div>
              ) : (
                /* ── Form State ── */
                <motion.form
                  key="form"
                  onSubmit={handleLogin}
                  noValidate
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Section title */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                  >
                    <SectionTitle index="01" label="ACCESS" />
                  </motion.div>

                  {/* Auth error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-red-800/30 bg-red-950/20 px-4 py-3"
                      >
                        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-red-400/80">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fields */}
                  <motion.div
                    className="space-y-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <PremiumInput
                      id="email"
                      label="Email Address"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      required
                    />

                    <PremiumInput
                      id="password"
                      label="Password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                      required
                    />
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.44 }}
                    className="space-y-5"
                  >
                    <EnterPortalButton loading={loading} />
                  </motion.div>

                  {/* Footnote */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.52 }}
                    className="border-t border-white/6 pt-5"
                  >
                    <p className="text-center font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/18">
                      All access attempts are logged.
                    </p>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
