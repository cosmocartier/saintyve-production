import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { token, firstName, lastName, password } = await request.json()

  console.log("[v0] registration/complete: received request", { token: token?.slice(0, 8), firstName, lastName, hasPassword: !!password })

  if (!token || !firstName || !lastName || !password) {
    console.log("[v0] registration/complete: missing fields", { token: !!token, firstName: !!firstName, lastName: !!lastName, password: !!password })
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log("[v0] registration/complete: env check", { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey })

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[v0] registration/complete: missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

  // Validate token
  console.log("[v0] registration/complete: looking up token", token)
  const { data: tokenData, error: tokenError } = await adminClient
    .from("registration_tokens")
    .select("id, email, used, expires_at")
    .eq("id", token)
    .single()

  console.log("[v0] registration/complete: token lookup result", { tokenData, tokenError })

  if (tokenError || !tokenData) {
    console.error("[v0] registration/complete: token not found or error", tokenError)
    return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 })
  }

  if (tokenData.used) {
    console.log("[v0] registration/complete: token already used")
    return NextResponse.json({ error: "This invitation link has already been used" }, { status: 410 })
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    console.log("[v0] registration/complete: token expired", tokenData.expires_at)
    return NextResponse.json({ error: "This invitation link has expired" }, { status: 410 })
  }

  // Create auth user via service role
  console.log("[v0] registration/complete: creating auth user for", tokenData.email)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: tokenData.email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
    },
  })

  console.log("[v0] registration/complete: createUser result", { userId: authData?.user?.id, authError })

  if (authError) {
    console.error("[v0] registration/complete: auth createUser error", { message: authError.message, status: authError.status })
    if (authError.message?.includes("already registered")) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: `Failed to create account: ${authError.message}` }, { status: 500 })
  }

  // The handle_new_user trigger already inserted the base profile row.
  // We just UPDATE to set full_name and access_granted=false.
  // NOTE: status column was dropped in migration 076 — do not reference it.
  console.log("[v0] registration/complete: updating profile for user", authData.user.id)
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      access_granted: false,
    })
    .eq("id", authData.user.id)

  if (profileError) {
    console.error("[v0] registration/complete: profile update error", { message: profileError.message, details: profileError.details, hint: profileError.hint })
  } else {
    console.log("[v0] registration/complete: profile updated successfully")
  }

  // Mark token as used
  const { error: tokenUpdateError } = await adminClient
    .from("registration_tokens")
    .update({ used: true })
    .eq("id", token)

  if (tokenUpdateError) {
    console.error("[v0] registration/complete: failed to mark token used", tokenUpdateError)
  }

  console.log("[v0] registration/complete: success")
  return NextResponse.json({ success: true, email: tokenData.email })
}
