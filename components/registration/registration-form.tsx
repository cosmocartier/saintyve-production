"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface RegistrationFormProps {
  token: string
  email: string
  onSuccess: () => void
}

export function RegistrationForm({ token, email, onSuccess }: RegistrationFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = (() => {
    if (password.length === 0) return null
    if (password.length < 8) return "weak"
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong"
    return "medium"
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/registration/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, firstName: firstName.trim(), lastName: lastName.trim(), password }),
      })

      const data = await res.json()
      console.log("[v0] registration form: API response", { status: res.status, data })

      if (!res.ok) {
        setError(data.error || `Error ${res.status} — please try again.`)
        return
      }

      onSuccess()
    } catch (err) {
      console.error("[v0] registration form: fetch exception", err)
      setError("Network error — please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    "w-full h-11 px-0 border-0 border-b border-[#2e2e2e] rounded-none text-[14px] text-white placeholder:text-[#444240] focus:border-[#666360] focus:outline-none transition-colors bg-transparent font-sans"
  const labelClass = "block text-[11px] uppercase tracking-[0.15em] text-[#555250] font-sans font-normal mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="Jane"
            autoComplete="given-name"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      {/* Email — locked */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full h-11 px-0 border-0 border-b border-[#2e2e2e] rounded-none text-[14px] text-[#444240] bg-transparent font-sans cursor-not-allowed select-none"
        />
      </div>

      {/* Password */}
      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-11`}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#444240] hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {(["weak", "medium", "strong"] as const).map((level, i) => {
                const filled =
                  (passwordStrength === "weak" && i === 0) ||
                  (passwordStrength === "medium" && i <= 1) ||
                  (passwordStrength === "strong" && i <= 2)
                const color =
                  passwordStrength === "weak"
                    ? "bg-red-400"
                    : passwordStrength === "medium"
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                return (
                  <div
                    key={level}
                    className={`h-[2px] flex-1 transition-colors ${filled ? color : "bg-[#2a2a2a]"}`}
                  />
                )
              })}
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#999690] font-sans">
              {passwordStrength}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[12px] text-red-400 tracking-wide font-sans">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-white text-[#0a0a0a] text-[11px] uppercase tracking-[0.2em] font-sans font-normal hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  )
}
