"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function submitContactForm(formData: FormData) {
  try {
    const fullName = formData.get("fullName")?.toString().trim()
    const email = formData.get("email")?.toString().trim()
    const topic = formData.get("topic")?.toString()
    const orderNumber = formData.get("orderNumber")?.toString().trim() || null
    const message = formData.get("message")?.toString().trim()
    const consent = formData.get("consent") === "true"

    // Honeypot field (should be empty)
    const honeypot = formData.get("companyWebsite")?.toString()

    if (!fullName || fullName.length < 2) {
      return { success: false, error: "Please enter your full name" }
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" }
    }

    if (!topic) {
      return { success: false, error: "Please select a topic" }
    }

    if (!message || message.length < 10) {
      return { success: false, error: "Please enter a message (at least 10 characters)" }
    }

    if (honeypot && honeypot.length > 0) {
      console.log("[v0] Honeypot triggered, rejecting submission")
      return { success: false, error: "Invalid submission detected" }
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const supabase = await createClient()
    const { error: dbError } = await supabase.from("contact_messages").insert({
      full_name: fullName,
      email,
      topic,
      order_number: orderNumber,
      message,
      consent,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: "new",
    })

    if (dbError) {
      console.error("[v0] Contact form submission error:", dbError)
      return { success: false, error: "Failed to submit your message. Please try again." }
    }

    console.log("[v0] Contact form submitted successfully from:", email)
    return { success: true }
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}
