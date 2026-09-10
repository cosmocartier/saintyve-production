import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("newsletter_emails")
      .insert({ email: email.trim().toLowerCase(), source: "private_access" })

    if (error) {
      // Duplicate email — treat as success so we don't leak info
      if (error.code === "23505") {
        return NextResponse.json({ success: true })
      }
      console.error("[request-access] Supabase error:", error)
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[request-access] Unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
