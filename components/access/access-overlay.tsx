"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { signInWithCredentials } from "@/lib/access-auth"

interface AccessOverlayProps {
  onSuccess?: () => void
}

type View = "login" | "request"

export function AccessOverlay({ onSuccess }: AccessOverlayProps) {
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState<View>("login")
  const [animating, setAnimating] = useState(false)

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Welcome state
  const [welcomeName, setWelcomeName] = useState<string | null>(null)
  const [welcomeVisible, setWelcomeVisible] = useState(false)

  // Request state
  const [requestEmail, setRequestEmail] = useState("")
  const [requestEmailFocused, setRequestEmailFocused] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [requested, setRequested] = useState(false)

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const switchView = (next: View) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setView(next)
      setAnimating(false)
    }, 320)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter your credentials.")
      return
    }
    setIsSubmitting(true)
    try {
      const { user, error, accessPending, firstName } = await signInWithCredentials(email.trim(), password)
      if (accessPending) {
        setLoginError("Your account is pending approval. You will receive an email once access is granted.")
        setIsSubmitting(false)
        return
      }
      if (error || !user) {
        setLoginError("Invalid credentials. Please try again.")
        setIsSubmitting(false)
        return
      }
      // Prefer first_name from profiles table, fall back to email prefix
      const name =
        firstName ||
        user.user_metadata?.first_name ||
        user.user_metadata?.full_name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there"
      setWelcomeName(name)
      // Fade in welcome, then reload after a brief pause
      setTimeout(() => setWelcomeVisible(true), 60)
      setTimeout(() => {
        onSuccess?.()
        window.location.reload()
      }, 2200)
    } catch {
      setLoginError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestError("")
    if (!requestEmail.trim()) {
      setRequestError("Please enter your email address.")
      return
    }
    setIsRequesting(true)
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: requestEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRequestError(data.error ?? "Something went wrong. Please try again.")
      } else {
        setRequested(true)
      }
    } catch {
      setRequestError("Something went wrong. Please try again.")
    } finally {
      setIsRequesting(false)
    }
  }

  if (dismissed) return null

  const panelStyle = {
    opacity: animating ? 0 : visible ? 1 : 0,
    transform: animating
      ? `translateY(calc(-5% + 10px))`
      : visible
      ? "translateY(-5%)"
      : "translateY(calc(-5% + 18px))",
    transition: animating
      ? "opacity 0.32s ease, transform 0.32s ease"
      : "opacity 0.7s ease 0.12s, transform 0.7s ease 0.12s",
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
        background: "rgba(0, 0, 0, 0.62)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      aria-modal="true"
      role="dialog"
      aria-label={view === "login" ? "Private access login" : "Request access"}
    >
      {/* ── WELCOME SCREEN ── */}
      {welcomeName !== null && (
        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: welcomeVisible ? 1 : 0,
            transform: welcomeVisible ? "translateY(-5%)" : "translateY(calc(-5% + 14px))",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <p
            className="font-sans text-[9px] uppercase tracking-[0.35em]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Welcome
          </p>
          <p
            className="font-sans font-light text-[28px] tracking-[0.12em] uppercase"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            {welcomeName}
          </p>
        </div>
      )}

      {/* ── LOGIN VIEW ── */}
      {view === "login" && welcomeName === null && (
        <div
          className="relative w-full max-w-[380px] mx-6 flex flex-col items-center"
          style={panelStyle}
        >
          <p
            className="w-full font-sans text-[9px] uppercase tracking-[0.35em] mb-8 text-center"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Private Access
          </p>

          <form onSubmit={handleLoginSubmit} noValidate className="w-full flex flex-col">
            {/* Email */}
            <div className="flex flex-col mb-8">
              <label
                htmlFor="access-email"
                className="font-sans text-[9px] uppercase tracking-[0.25em] mb-3 transition-colors duration-300"
                style={{ color: emailFocused ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)" }}
              >
                Email
              </label>
              <div
                className="relative pb-px"
                style={{
                  borderBottom: emailFocused
                    ? "1px solid rgba(255,255,255,0.75)"
                    : "1px solid rgba(255,255,255,0.18)",
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  id="access-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError("") }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent font-sans text-[13px] pb-2 focus:outline-none"
                  style={{ color: "rgba(255,255,255,0.88)", caretColor: "rgba(255,255,255,0.8)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col mb-10">
              <label
                htmlFor="access-password"
                className="font-sans text-[9px] uppercase tracking-[0.25em] mb-3 transition-colors duration-300"
                style={{ color: passwordFocused ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)" }}
              >
                Password
              </label>
              <div
                className="relative pb-px"
                style={{
                  borderBottom: passwordFocused
                    ? "1px solid rgba(255,255,255,0.75)"
                    : "1px solid rgba(255,255,255,0.18)",
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  id="access-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError("") }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent font-sans text-[13px] pb-2 pr-8 focus:outline-none"
                  style={{ color: "rgba(255,255,255,0.88)", caretColor: "rgba(255,255,255,0.8)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 bottom-2 transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)")}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff strokeWidth={1} className="w-[15px] h-[15px]" />
                    : <Eye strokeWidth={1} className="w-[15px] h-[15px]" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p
                className="font-sans text-[10px] tracking-wide mb-6 -mt-6"
                style={{ color: "rgba(220,80,80,0.9)" }}
                role="alert"
                aria-live="polite"
              >
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] font-sans text-[9px] uppercase tracking-[0.3em] transition-all duration-300 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: isSubmitting ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.82)",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.16)"
                  ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.38)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)"
                  ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"
                }
              }}
            >
              {isSubmitting ? "Verifying..." : "Access Store"}
            </button>
          </form>

          <p
            className="mt-8 font-sans text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Access is by invitation only.{" "}
            <button
              type="button"
              onClick={() => switchView("request")}
              className="transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
              style={{ color: "rgba(255,255,255,0.38)", font: "inherit", letterSpacing: "inherit" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)")}
            >
              Want access?
            </button>
          </p>
        </div>
      )}

      {/* ── REQUEST ACCESS VIEW ── */}
      {view === "request" && (
        <div
          className="relative w-full max-w-[380px] mx-6 flex flex-col items-center"
          style={panelStyle}
        >
          {!requested ? (
            <form onSubmit={handleRequestSubmit} noValidate className="w-full flex flex-col">
              {/* Email */}
              <div className="flex flex-col mb-10">
                <label
                  htmlFor="request-email"
                  className="font-sans text-[9px] uppercase tracking-[0.25em] mb-3 transition-colors duration-300"
                  style={{ color: requestEmailFocused ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)" }}
                >
                  Email
                </label>
                <div
                  className="relative pb-px"
                  style={{
                    borderBottom: requestEmailFocused
                      ? "1px solid rgba(255,255,255,0.75)"
                      : "1px solid rgba(255,255,255,0.18)",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <input
                    id="request-email"
                    type="email"
                    autoComplete="email"
                    value={requestEmail}
                    onChange={(e) => { setRequestEmail(e.target.value); setRequestError("") }}
                    onFocus={() => setRequestEmailFocused(true)}
                    onBlur={() => setRequestEmailFocused(false)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-transparent font-sans text-[13px] pb-2 focus:outline-none"
                    style={{ color: "rgba(255,255,255,0.88)", caretColor: "rgba(255,255,255,0.8)" }}
                  />
                </div>
              </div>

              {requestError && (
                <p
                  className="font-sans text-[10px] tracking-wide mb-6 -mt-6"
                  style={{ color: "rgba(220,80,80,0.9)" }}
                  role="alert"
                  aria-live="polite"
                >
                  {requestError}
                </p>
              )}

              <button
                type="submit"
                disabled={isRequesting}
                className="w-full h-[46px] font-sans text-[9px] uppercase tracking-[0.3em] transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  background: isRequesting ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: isRequesting ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.82)",
                }}
                onMouseEnter={(e) => {
                  if (!isRequesting) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.16)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.38)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRequesting) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"
                  }
                }}
              >
                {isRequesting ? "Sending..." : "Request Access"}
              </button>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center gap-6">
              <p
                className="font-sans text-[11px] tracking-[0.06em] text-center leading-loose"
                style={{ color: "rgba(255,255,255,0.52)" }}
              >
                Your request has been received.<br />
                We review every application personally<br />
                and will reach out shortly.
              </p>
              <a
                href="https://www.instagram.com/designerdrip.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[9px] uppercase tracking-[0.35em] transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.38)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)")}
              >
                Join our Community
              </a>
            </div>
          )}

        </div>
      )}

      {/* Instagram — pinned to bottom of viewport, centered, hidden on welcome */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{
          paddingBottom: "clamp(24px, 4vh, 40px)",
          opacity: visible && welcomeName === null ? 1 : 0,
          pointerEvents: welcomeName !== null ? "none" : "auto",
          transition: "opacity 0.7s ease 0.2s",
        }}
      >
        <a
          href="https://www.instagram.com/designerdrip.store/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[9px] uppercase tracking-[0.35em] transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.28)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.58)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.28)")}
        >
          Join our Community
        </a>
      </div>
    </div>
  )
}
