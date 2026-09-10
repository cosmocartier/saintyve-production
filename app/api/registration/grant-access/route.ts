import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { sendAccessGrantedEmail } from "@/lib/access-granted-email"

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const prefix = "DD-"
  let code = prefix
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
  const { profileId } = await request.json()
  console.log("[v0] grant-access: received request", { profileId })

  if (!profileId) {
    return NextResponse.json({ error: "profileId is required" }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY
  console.log("[v0] grant-access: env check", { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey, hasResend: !!resendKey })

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[v0] grant-access: missing Supabase env vars")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

  // Fetch the profile to get email and name
  const { data: profile, error: profileFetchError } = await adminClient
    .from("profiles")
    .select("email, full_name, first_name")
    .eq("id", profileId)
    .single()

  console.log("[v0] grant-access: profile fetch", { profile, error: profileFetchError })

  if (profileFetchError || !profile) {
    console.error("[v0] grant-access: profile not found", profileFetchError)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Grant access
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ access_granted: true })
    .eq("id", profileId)

  console.log("[v0] grant-access: access_granted update", { error: updateError })

  if (updateError) {
    console.error("[v0] grant-access: update failed", updateError)
    return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
  }

  // Generate a unique coupon code with retry on collision
  let couponCode = generateCouponCode()
  let inserted = false
  for (let attempt = 0; attempt < 5; attempt++) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { error: couponError } = await adminClient.from("coupons").insert({
      code: couponCode,
      discount_type: "percentage",
      discount_value: 15,
      user_email: profile.email,
      usage_limit: 1,
      times_used: 0,
      enabled: true,
      valid_from: new Date().toISOString(),
      valid_until: expiresAt,
      minimum_order_value: 0,
    })

    console.log("[v0] grant-access: coupon insert attempt", attempt + 1, { code: couponCode, error: couponError })

    if (!couponError) {
      inserted = true
      break
    }

    if (couponError.code === "23505") {
      couponCode = generateCouponCode()
      continue
    }

    console.error("[v0] grant-access: coupon insert fatal error", { message: couponError.message, details: couponError.details, hint: couponError.hint, code: couponError.code })
    break
  }

  if (!inserted) {
    console.error("[v0] grant-access: failed to insert coupon after retries — proceeding without coupon")
  }

  // Send welcome email
  const customerName = profile.first_name || profile.full_name || ""
  console.log("[v0] grant-access: sending email to", profile.email, "name:", customerName, "code:", couponCode)
  const emailSent = await sendAccessGrantedEmail({
    customerEmail: profile.email,
    customerName,
    couponCode,
  })
  console.log("[v0] grant-access: email sent result", { emailSent })

  return NextResponse.json({ success: true })
}
