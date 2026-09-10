"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserMembership() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated", membership: null }
    }

    const { data, error } = await supabase.from("memberships").select("*").eq("user_id", user.id).single()

    if (error) {
      console.error("[v0] Error fetching membership:", error)
      return { error: error.message, membership: null }
    }

    return { error: null, membership: data }
  } catch (error) {
    console.error("[v0] Error in getUserMembership:", error)
    return { error: "Failed to fetch membership", membership: null }
  }
}
