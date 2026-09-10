import { createClient } from "@/lib/supabase/server"

/**
 * Assigns a reward to all users with the matching tier
 * Creates entries in loyalty_user_rewards for each eligible user
 */
export async function assignRewardToTierUsers(rewardId: string, tier: string, month: string) {
  const supabase = await createClient()

  console.log("[v0] ========================================")
  console.log("[v0] Starting assignRewardToTierUsers")
  console.log("[v0] Reward ID:", rewardId)
  console.log("[v0] Target Tier:", tier)
  console.log("[v0] Target Month:", month)
  console.log("[v0] ========================================")

  const { data: allMemberships, error: allMembershipsError } = await supabase
    .from("memberships")
    .select("user_id, status")
    .limit(100)

  if (!allMembershipsError && allMemberships) {
    console.log("[v0] Sample of memberships in database:")
    allMemberships.slice(0, 10).forEach((m) => {
      console.log(`[v0]   - User ${m.user_id}: status = "${m.status}"`)
    })

    const statusCounts: Record<string, number> = {}
    allMemberships.forEach((m) => {
      const status = m.status || "null"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    console.log("[v0] Status distribution:")
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`[v0]   - "${status}": ${count} users`)
    })
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select("user_id, status")
    .eq("status", tier)

  if (membershipsError) {
    console.error("[v0] Error fetching users for tier:", membershipsError)
    throw membershipsError
  }

  console.log(`[v0] Found ${memberships?.length || 0} users with EXACT match for tier "${tier}"`)

  if (!memberships || memberships.length === 0) {
    console.log("[v0] ❌ NO USERS FOUND WITH THIS TIER")
    console.log("[v0] This means either:")
    console.log("[v0]   1. No users exist in the database")
    console.log("[v0]   2. The tier name doesn't match the status column values")
    console.log("[v0]   3. All users have NULL status values")
    return { assigned: 0 }
  }

  const users = memberships.map((m) => ({ id: m.user_id, status: m.status }))

  // Check which users already have this reward
  const { data: existingRewards, error: existingError } = await supabase
    .from("loyalty_user_rewards")
    .select("user_id")
    .eq("reward_id", rewardId)

  if (existingError) {
    console.error("[v0] Error checking existing rewards:", existingError)
    throw existingError
  }

  const existingUserIds = new Set(existingRewards?.map((r) => r.user_id) || [])
  console.log(`[v0] ${existingUserIds.size} users already have this reward`)

  // Filter out users who already have this reward
  const newUsers = users.filter((user) => !existingUserIds.has(user.id))

  console.log(`[v0] ${newUsers.length} new users to assign reward to`)

  if (newUsers.length === 0) {
    console.log("[v0] All eligible users already have this reward")
    return { assigned: 0 }
  }

  // Create reward entries for new users
  const userRewards = newUsers.map((user) => ({
    user_id: user.id,
    reward_id: rewardId,
    status: "available",
    claimed_at: null,
  }))

  const { error: insertError } = await supabase.from("loyalty_user_rewards").insert(userRewards)

  if (insertError) {
    console.error("[v0] Error inserting user rewards:", insertError)
    throw insertError
  }

  console.log(`[v0] Successfully assigned reward to ${newUsers.length} users`)

  return { assigned: newUsers.length }
}
