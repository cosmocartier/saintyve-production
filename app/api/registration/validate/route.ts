import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("registration_tokens")
    .select("id, email, used, expires_at")
    .eq("id", token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 404 })
  }

  if (data.used) {
    return NextResponse.json({ error: "This invitation link has already been used" }, { status: 410 })
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invitation link has expired" }, { status: 410 })
  }

  return NextResponse.json({ email: data.email })
}
