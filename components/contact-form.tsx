"use client"

import type React from "react"

import { useState } from "react"
import { submitContactForm } from "@/app/actions/submit-contact-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    topic: "",
    orderNumber: "",
    message: "",
    consent: false,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormState(null)

    const formDataObj = new FormData()
    formDataObj.append("fullName", formData.fullName)
    formDataObj.append("email", formData.email)
    formDataObj.append("topic", formData.topic)
    formDataObj.append("orderNumber", formData.orderNumber)
    formDataObj.append("message", formData.message)
    formDataObj.append("consent", formData.consent.toString())

    formDataObj.append("companyWebsite", "")

    const result = await submitContactForm(formDataObj)

    setIsSubmitting(false)

    if (result.success) {
      setFormState({
        success: true,
        message: "Thank you for contacting us. We'll respond within 24-48 hours.",
      })
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        topic: "",
        orderNumber: "",
        message: "",
        consent: false,
      })
    } else {
      setFormState({
        success: false,
        message: result.error || "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-100 p-8">
      <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-black mb-8">Send us a message</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-[11px] font-mono uppercase tracking-wide text-black">
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="h-11 text-[13px] font-mono bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] font-mono uppercase tracking-wide text-black">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11 text-[13px] font-mono bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="john@example.com"
          />
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-[11px] font-mono uppercase tracking-wide text-black">
            Topic *
          </Label>
          <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
            <SelectTrigger className="h-11 text-[13px] font-mono bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Order & Shipping">Order & Shipping</SelectItem>
              <SelectItem value="Returns & Refunds">Returns & Refunds</SelectItem>
              <SelectItem value="Platinum Membership">Platinum Membership</SelectItem>
              <SelectItem value="Product Question">Product Question</SelectItem>
              <SelectItem value="Payment">Payment</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Number (optional) */}
        <div className="space-y-2">
          <Label htmlFor="orderNumber" className="text-[11px] font-mono uppercase tracking-wide text-black">
            Order Number
          </Label>
          <Input
            id="orderNumber"
            type="text"
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            className="h-11 text-[13px] font-mono bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Optional"
          />
          <p className="text-[11px] font-mono text-gray-500">If this is about an order, include your order number.</p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-[11px] font-mono uppercase tracking-wide text-black">
            Message *
          </Label>
          <Textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="text-[13px] font-mono bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black resize-none"
            placeholder="Tell us how we can help..."
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => setFormData({ ...formData, consent: checked === true })}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-[11px] font-mono text-gray-600 leading-relaxed cursor-pointer">
            I agree to be contacted by email regarding my request.
          </Label>
        </div>

        {/* Honeypot field (hidden from users, catches bots) */}
        <input
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-black text-white text-[11px] font-mono uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </Button>

        {/* Success/Error Messages */}
        {formState && (
          <div
            className={`p-4 border text-[12px] font-mono ${
              formState.success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {formState.message}
          </div>
        )}
      </form>
    </div>
  )
}
