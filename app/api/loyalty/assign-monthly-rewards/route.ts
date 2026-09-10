import { NextResponse } from "next/server"
import { assignMonthlyRewards } from "@/lib/loyalty/assign-monthly-rewards"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { month } = await request.json()

    const result = await assignMonthlyRewards(month)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in assign-monthly-rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
