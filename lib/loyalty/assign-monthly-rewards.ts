import { createClient } from "@/lib/supabase/server"

export async function assignMonthlyRewards(month?: string) {
  const supabase = await createClient()

  // Use current month if not specified
  const targetMonth = month || new Date().toISOString().slice(0, 7) // Format: YYYY-MM

  console.log(`[v0] Assigning monthly rewards for: ${targetMonth}`)

  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select("user_id, status")
    .not("status", "is", null)

  if (membershipsError) {
    console.error("[v0] Error fetching memberships:", membershipsError)
    throw new Error(`Failed to fetch memberships: ${membershipsError.message}`)
  }

  console.log(`[v0] Found ${memberships?.length || 0} users with tier status`)

  // Get all active rewards for the target month
  const { data: rewards, error: rewardsError } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("month", targetMonth)
    .eq("is_active", true)

  if (rewardsError) {
    console.error("[v0] Error fetching rewards:", rewardsError)
    throw new Error(`Failed to fetch rewards: ${rewardsError.message}`)
  }

  console.log(`[v0] Found ${rewards?.length || 0} active rewards for ${targetMonth}`)

  let assignedCount = 0
  let skippedCount = 0

  // For each user, assign rewards matching their tier
  for (const membership of memberships || []) {
    const userTier = membership.status
    const userId = membership.user_id

    // Find rewards for this user's tier
    const userRewards = rewards?.filter((r) => r.tier === userTier) || []

    console.log(`[v0] User ${userId} (${userTier}): ${userRewards.length} rewards to assign`)

    for (const reward of userRewards) {
      // Check if this reward is already assigned to the user
      const { data: existing } = await supabase
        .from("loyalty_user_rewards")
        .select("id")
        .eq("user_id", userId)
        .eq("reward_id", reward.id)
        .maybeSingle()

      if (existing) {
        skippedCount++
        continue
      }

      // Assign the reward
      const { error: assignError } = await supabase.from("loyalty_user_rewards").insert({
        user_id: userId,
        reward_id: reward.id,
        status: "available",
      })

      if (assignError) {
        console.error(`[v0] Error assigning reward ${reward.id} to user ${userId}:`, assignError)
      } else {
        assignedCount++
      }
    }
  }

  console.log(`[v0] Reward assignment complete: ${assignedCount} assigned, ${skippedCount} skipped`)

  return {
    success: true,
    month: targetMonth,
    usersProcessed: memberships?.length || 0,
    rewardsAssigned: assignedCount,
    rewardsSkipped: skippedCount,
  }
}
