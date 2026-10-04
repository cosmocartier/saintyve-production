"use server"

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

export interface CreateReservationPayload {
  name: string
  email: string
  phone: string
  productId: string
  productName: string
  productBrand: string | null
  productUrl: string
}

export interface CreateReservationResult {
  success: boolean
  error?: string
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export async function createReservationAction(
  payload: CreateReservationPayload,
): Promise<CreateReservationResult> {
  const name = payload.name?.trim() ?? ""
  const email = payload.email?.trim() ?? ""
  const phone = payload.phone?.trim() ?? ""

  if (!name) {
    return { success: false, error: "Please enter your name." }
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address." }
  }
  if (!phone) {
    return { success: false, error: "Please enter your phone number." }
  }
  if (!payload.productId) {
    return { success: false, error: "Missing product reference." }
  }

  const supabase = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const reservedAt = new Date()
  const expiresAt = new Date(reservedAt.getTime() + 24 * 60 * 60 * 1000)

  const { error } = await supabase.from("product_reservations").insert({
    name,
    email,
    phone,
    product_id: payload.productId,
    product_name: payload.productName,
    product_brand: payload.productBrand,
    product_url: payload.productUrl,
    reserved_at: reservedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: "active",
  })

  if (error) {
    console.error("[v0] createReservationAction: insert failed", error)
    return { success: false, error: "Something went wrong. Please try again." }
  }

  return { success: true }
}
