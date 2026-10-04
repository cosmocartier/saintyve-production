"use client"

import type React from "react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createReservationAction } from "@/app/actions/create-reservation"

interface ReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  productBrand: string | null
  productUrl: string
}

type FormErrors = Partial<Record<"name" | "email" | "phone", string>>

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function ReservationModal({
  open,
  onOpenChange,
  productId,
  productName,
  productBrand,
  productUrl,
}: ReservationModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReserved, setIsReserved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const resetState = () => {
    setName("")
    setEmail("")
    setPhone("")
    setErrors({})
    setIsReserved(false)
    setSubmitError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset shortly after close so the closing animation doesn't flash the empty form.
      setTimeout(resetState, 300)
    }
    onOpenChange(next)
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}
    if (!name.trim()) nextErrors.name = "Please enter your name."
    if (!isValidEmail(email)) nextErrors.email = "Please enter a valid email address."
    if (!phone.trim()) nextErrors.phone = "Please enter your phone number."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await createReservationAction({
        name,
        email,
        phone,
        productId,
        productName,
        productBrand,
        productUrl,
      })

      if (result.success) {
        setIsReserved(true)
      } else {
        setSubmitError(result.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Reservation submission failed", error)
      setSubmitError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[88vh] w-full sm:max-w-[440px] sm:mx-auto rounded-t-[30px] sm:rounded-[2px] border-0 p-0 overflow-y-auto bg-white [&>button]:hidden duration-[380ms] data-[state=open]:duration-[380ms] data-[state=closed]:duration-300 data-[state=open]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Reserve this piece</SheetTitle>
        </SheetHeader>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-[22px] pb-3 sm:hidden">
          <div className="w-12 h-1 rounded-full bg-[#E6E6E6]" />
        </div>

        <div className="px-7 pt-7 pb-10 sm:pt-9">
          {isReserved ? (
            <div className="text-center">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] uppercase text-black mb-3">
                Piece Reserved
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-1">
                Your reservation is confirmed for the next 24 hours.
              </p>
              <p className="text-sm text-black font-medium tracking-wide mb-8">{productName}</p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="w-full h-[50px] flex items-center justify-center bg-[#111111] text-white text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-black/80 transition-colors active:scale-[0.99]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-[18px] font-medium tracking-wide text-black mb-2">Reserve this piece for 24 hours.</h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-7">
                We&apos;ll hold {productName} for you. Share your details and our team will be in touch to complete
                your purchase.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reservation-name" className="sr-only">
                    Name
                  </label>
                  <input
                    id="reservation-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    autoComplete="name"
                    className={`w-full h-[48px] px-4 border bg-white text-sm tracking-wide text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors ${
                      errors.name ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="reservation-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="reservation-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className={`w-full h-[48px] px-4 border bg-white text-sm tracking-wide text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors ${
                      errors.email ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="reservation-phone" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    id="reservation-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    autoComplete="tel"
                    className={`w-full h-[48px] px-4 border bg-white text-sm tracking-wide text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors ${
                      errors.phone ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
                </div>

                {submitError && <p className="text-xs text-red-500">{submitError}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[50px] flex items-center justify-center bg-[#111111] text-white text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-black/80 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Reserving..." : "Reserve Piece"}
                </button>
              </form>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
