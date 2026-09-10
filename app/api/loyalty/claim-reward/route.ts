import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
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

    const { user_reward_id } = await request.json()

    if (!user_reward_id) {
      return NextResponse.json({ error: "user_reward_id is required" }, { status: 400 })
    }

    console.log(`[v0] User ${user.id} attempting to claim reward ${user_reward_id}`)

    // Get the user reward with ownership check
    const { data: userReward, error: fetchError } = await supabase
      .from("loyalty_user_rewards")
      .select("*, reward:loyalty_rewards(*)")
      .eq("id", user_reward_id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !userReward) {
      console.error("[v0] Reward not found or unauthorized:", fetchError)
      return NextResponse.json({ error: "Reward not found or unauthorized" }, { status: 404 })
    }

    // Check if already claimed
    if (userReward.status === "claimed") {
      return NextResponse.json({ error: "Reward already claimed" }, { status: 400 })
    }

    // Check if expired
    if (userReward.status === "expired") {
      return NextResponse.json({ error: "Reward has expired" }, { status: 400 })
    }

    // Mark as claimed
    const { data: updatedReward, error: updateError } = await supabase
      .from("loyalty_user_rewards")
      .update({
        status: "claimed",
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user_reward_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error claiming reward:", updateError)
      return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
    }

    console.log(`[v0] Reward ${user_reward_id} successfully claimed by user ${user.id}`)

    return NextResponse.json({
      success: true,
      reward: updatedReward,
    })
  } catch (error) {
    console.error("[v0] Unexpected error in claim-reward:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
