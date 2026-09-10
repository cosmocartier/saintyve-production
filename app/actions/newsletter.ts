"use server"

import { createClient } from "@/lib/supabase/server"

export async function subscribeToNewsletter(email: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("newsletter_emails").insert({
      email: email.toLowerCase().trim(),
    })

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === "23505") {
        return {
          success: true,
          message: "You're already subscribed to our newsletter!",
        }
      }
      throw error
    }

    return {
      success: true,
      message: "Successfully subscribed to newsletter!",
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return {
      success: false,
      error: "Failed to subscribe. Please try again later.",
    }
  }
}
