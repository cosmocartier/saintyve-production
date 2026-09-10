import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7)

    console.log(`[v0] Fetching monthly rewards for user ${user.id}, month: ${currentMonth}`)

    // Get user's rewards for current month with joined reward details
    const { data: userRewards, error: rewardsError } = await supabase
      .from("loyalty_user_rewards")
      .select(`
        id,
        status,
        claimed_at,
        created_at,
        reward:loyalty_rewards (
          id,
          tier,
          month,
          title,
          description,
          reward_type,
          value,
          expires_at
        )
      `)
      .eq("user_id", user.id)
      .eq("reward.month", currentMonth)
      .order("created_at", { ascending: false })

    if (rewardsError) {
      console.error("[v0] Error fetching user rewards:", rewardsError)
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
    }

    console.log(`[v0] Found ${userRewards?.length || 0} rewards for user`)

    return NextResponse.json({
      success: true,
      month: currentMonth,
      rewards: userRewards || [],
    })
  } catch (error) {
    console.error("[v0] Unexpected error in my-monthly-rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
