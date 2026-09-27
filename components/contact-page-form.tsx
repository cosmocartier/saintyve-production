"use client"

import type React from "react"

import { useState } from "react"
import { submitContactForm } from "@/app/actions/submit-contact-form"

const inputClass =
  "w-full h-12 px-0 border-0 border-b border-zinc-300 rounded-none text-[14px] text-black placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors bg-transparent font-sans"
const textareaClass =
  "w-full min-h-32 px-0 py-2 border-0 border-b border-zinc-300 rounded-none text-[14px] text-black placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors bg-transparent font-sans resize-none"
const labelClass = "block text-[11px] uppercase tracking-[0.1em] text-black mb-2"

export function ContactPageForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormState(null)

    const formDataObj = new FormData()
    formDataObj.append("fullName", formData.fullName)
    formDataObj.append("email", formData.email)
    formDataObj.append("topic", formData.subject)
    formDataObj.append("orderNumber", "")
    formDataObj.append("message", formData.message)
    formDataObj.append("consent", "true")
    formDataObj.append("companyWebsite", "")

    const result = await submitContactForm(formDataObj)

    setIsSubmitting(false)

    if (result.success) {
      setFormState({ success: true, message: "Thank you. We'll be in touch shortly." })
      setFormData({ fullName: "", email: "", subject: "", message: "" })
    } else {
      setFormState({ success: false, message: result.error || "Something went wrong. Please try again." })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={inputClass}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={inputClass}
          placeholder="What is this regarding?"
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={textareaClass}
          placeholder="Tell us how we can help..."
        />
      </div>

      {/* Honeypot field */}
      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="text-[11px] uppercase tracking-[0.15em] text-black border-b border-black pb-1 hover:opacity-60 transition-opacity disabled:opacity-40 min-h-11"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>

      {formState && (
        <p
          role="status"
          className={`text-[12px] font-sans leading-relaxed ${
            formState.success ? "text-black" : "text-red-600"
          }`}
        >
          {formState.message}
        </p>
      )}
    </form>
  )
}

export default ContactPageForm
