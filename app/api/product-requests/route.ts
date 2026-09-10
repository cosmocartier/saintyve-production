import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { product_name, brand, reference_link, details, image_urls, customer_name, customer_email, user_id } = body

    // Validate required fields
    if (!product_name || !details || !customer_name || !customer_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert product request into database
    const { data, error } = await supabase
      .from("product_requests")
      .insert({
        product_name,
        brand,
        reference_link,
        details,
        image_urls,
        customer_name,
        customer_email,
        user_id,
        status: "pending", // Use "pending" status to match database constraint
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to save product request" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Product request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
