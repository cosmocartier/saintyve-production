"use client"

import { useState } from "react"
import { RegistrationForm } from "@/components/registration/registration-form"

interface Props {
  token: string
  email: string
  isInvalid: boolean
  isUsed: boolean
  isExpired: boolean
}

export function RegistrationPageClient({ token, email, isInvalid, isUsed, isExpired }: Props) {
  const [success, setSuccess] = useState(false)

  // Already used
  if (isUsed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[13px] uppercase tracking-[0.15em] text-white font-sans mb-3">Already Redeemed</p>
          <p className="text-[12px] text-[#666360] tracking-wide font-sans leading-relaxed">
            This invitation has already been used to create an account.
          </p>
        </div>
      </div>
    )
  }

  // Success — replace everything with just the two lines
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-[360px] animate-in fade-in duration-700">
          <p className="text-[15px] text-white font-sans font-normal leading-relaxed tracking-wide mb-4">
            Thank you for joining Designerdrip.
          </p>
          <p className="text-[13px] text-[#666360] font-sans leading-relaxed tracking-wide">
            We are preparing your account. Access is typically granted within 24 hours — you will receive a confirmation
            email the moment your profile is ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#555250] font-sans mb-3">
            Private Access
          </p>
          <h1 className="text-[22px] font-normal tracking-[0.08em] text-white font-sans uppercase">
            Designerdrip
          </h1>
        </div>

        <div className="px-8">
          {isInvalid ? (
            <InvalidState reason="not-found" />
          ) : isExpired ? (
            <InvalidState reason="expired" />
          ) : (
            <RegistrationForm token={token} email={email} onSuccess={() => setSuccess(true)} />
          )}
        </div>

        {!isInvalid && !isExpired && (
          <p className="text-center text-[11px] text-[#444240] tracking-wide font-sans mt-6">
            This invitation is personal and cannot be shared.
          </p>
        )}
      </div>
    </div>
  )
}

function InvalidState({ reason }: { reason: "not-found" | "expired" }) {
  const messages = {
    "not-found": {
      title: "Invalid Invitation",
      body: "This invitation link is not valid. Please contact us if you believe this is an error.",
    },
    expired: {
      title: "Invitation Expired",
      body: "This invitation link has expired. Please contact us to receive a new one.",
    },
  }

  const { title, body } = messages[reason]

  return (
    <div className="text-center py-4">
      <div className="w-10 h-10 border border-[#2a2a2a] flex items-center justify-center mx-auto mb-5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v5M8 11v1" stroke="#555250" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px] uppercase tracking-[0.15em] text-white font-sans mb-3">{title}</p>
      <p className="text-[12px] text-[#666360] tracking-wide font-sans leading-relaxed">{body}</p>
    </div>
  )
}
