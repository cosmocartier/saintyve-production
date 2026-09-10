"use server"

import { createClient } from "@/lib/supabase/server"

export async function getOrCreateUserMonthlyRewards() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: "Not authenticated", rewards: [] }
  }

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", user.id)
    .single()

  if (membershipError || !membership) {
    console.error("[v0] Error fetching membership:", membershipError)
    return { error: "Profile not found", rewards: [] }
  }

  const userTier = membership.status || "bronze"

  // Get current month (YYYY-MM format)
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  // Get all active rewards for this tier and month
  const { data: availableRewards, error: rewardsError } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("tier", userTier)
    .eq("month", currentMonth)
    .eq("is_active", true)

  if (rewardsError) {
    console.error("[v0] Error fetching loyalty_rewards:", rewardsError)
    return { error: "Failed to fetch rewards", rewards: [] }
  }

  if (!availableRewards || availableRewards.length === 0) {
    return { rewards: [] }
  }

  // For each reward, check if user already has it, if not create it
  for (const reward of availableRewards) {
    const { data: existing } = await supabase
      .from("loyalty_user_rewards")
      .select("id")
      .eq("user_id", user.id)
      .eq("reward_id", reward.id)
      .maybeSingle()

    // If it doesn't exist, create it
    if (!existing) {
      const { error: insertError } = await supabase.from("loyalty_user_rewards").insert({
        user_id: user.id,
        reward_id: reward.id,
        status: "available",
        claimed_at: null,
      })

      if (insertError) {
        console.error("[v0] Error inserting loyalty_user_reward:", insertError)
      }
    }
  }

  // Now fetch the complete list of user rewards with joined data
  const { data: userRewards, error: userRewardsError } = await supabase
    .from("loyalty_user_rewards")
    .select(`
      id,
      status,
      claimed_at,
      reward_id,
      loyalty_rewards (
        id,
        title,
        description,
        reward_type,
        value,
        tier,
        month,
        expires_at
      )
    `)
    .eq("user_id", user.id)
    .in(
      "reward_id",
      availableRewards.map((r) => r.id),
    )

  if (userRewardsError) {
    console.error("[v0] Error fetching user rewards:", userRewardsError)
    return { error: "Failed to fetch user rewards", rewards: [] }
  }

  // Transform the data to a more usable format
  const rewards = (userRewards || []).map((ur) => {
    const reward = ur.loyalty_rewards as any
    return {
      id: ur.id,
      reward_id: ur.reward_id,
      title: reward?.title || "",
      description: reward?.description || "",
      reward_type: reward?.reward_type || "",
      value: reward?.value || null,
      tier: reward?.tier || "",
      month: reward?.month || "",
      expires_at: reward?.expires_at || null,
      status: ur.status,
      claimed_at: ur.claimed_at,
    }
  })

  return { rewards }
}

export async function claimMonthlyReward(userRewardId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    console.log("[v0] Claim reward failed: User not authenticated")
    return { error: "Not authenticated" }
  }

  console.log("[v0] ========================================")
  console.log("[v0] Starting claimMonthlyReward")
  console.log("[v0] User ID:", user.id)
  console.log("[v0] Reward ID:", userRewardId)
  console.log("[v0] ========================================")

  const { data: userReward, error: fetchError } = await supabase
    .from("loyalty_user_rewards")
    .select(`
      id,
      status,
      reward_id,
      loyalty_rewards (
        reward_type,
        value,
        title
      )
    `)
    .eq("id", userRewardId)
    .eq("user_id", user.id)
    .eq("status", "available")
    .single()

  if (fetchError || !userReward) {
    console.error("[v0] Error fetching reward:", fetchError)
    return { error: "Reward not found or already claimed" }
  }

  const rewardData = userReward.loyalty_rewards as any
  console.log("[v0] Reward data:", {
    title: rewardData?.title,
    type: rewardData?.reward_type,
    value: rewardData?.value,
  })

  // Update the reward status to claimed
  const { error: updateError } = await supabase
    .from("loyalty_user_rewards")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
    })
    .eq("id", userRewardId)
    .eq("user_id", user.id)
    .eq("status", "available")

  if (updateError) {
    console.error("[v0] Error claiming reward:", updateError)
    return { error: "Failed to claim reward" }
  }

  console.log("[v0] Reward status updated to 'claimed'")

  if (rewardData?.reward_type === "credit" && rewardData?.value) {
    const creditsToAdd = Math.floor(Number(rewardData.value))
    console.log("[v0] This is a CREDIT reward. Credits to add:", creditsToAdd)

    // First, get current credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile for credits:", profileError)
      return { error: "Failed to fetch user profile" }
    }

    const currentCredits = profile?.credits || 0
    console.log("[v0] Current credits:", currentCredits)
    console.log("[v0] New credits will be:", currentCredits + creditsToAdd)

    // Update profile with new credit amount
    const { error: creditUpdateError } = await supabase
      .from("profiles")
      .update({
        credits: currentCredits + creditsToAdd,
      })
      .eq("id", user.id)

    if (creditUpdateError) {
      console.error("[v0] Error updating credits:", creditUpdateError)
      return { error: "Failed to update credits" }
    }

    console.log(`[v0] ✅ Successfully added ${creditsToAdd} credits to user ${user.id}`)
    console.log(`[v0] ✅ New balance: ${currentCredits + creditsToAdd}`)
    console.log("[v0] ========================================")

    return { success: true, creditsAdded: creditsToAdd, newBalance: currentCredits + creditsToAdd }
  } else {
    console.log("[v0] Not a credit reward, skipping credit addition")
    console.log("[v0] ========================================")
  }

  return { success: true }
}
