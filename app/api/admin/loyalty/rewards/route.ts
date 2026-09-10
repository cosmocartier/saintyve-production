import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { assignRewardToTierUsers } from "@/lib/loyalty/assign-reward-to-tier-users"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month")
    const tier = searchParams.get("tier")

    let query = supabase.from("loyalty_rewards").select("*").order("created_at", { ascending: false })

    if (month) {
      query = query.eq("month", month)
    }

    if (tier) {
      query = query.eq("tier", tier)
    }

    const { data: rewards, error } = await query

    if (error) {
      console.error("Error fetching rewards:", error)
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
    }

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("Error in GET /api/admin/loyalty/rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, tier, reward_type, value, month, expires_at, is_active, product_id } = body

    const { data: reward, error } = await supabase
      .from("loyalty_rewards")
      .insert({
        title,
        description,
        tier,
        reward_type,
        value: reward_type === "free_item" || value === "" ? null : value,
        month,
        expires_at,
        is_active,
        product_id: product_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating reward:", error)
      return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
    }

    if (is_active && reward.id) {
      try {
        const result = await assignRewardToTierUsers(reward.id, tier, month)
        console.log(`[v0] Assigned reward to ${result.assigned} users`)
      } catch (assignError) {
        console.error("[v0] Error assigning reward to users:", assignError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ reward })
  } catch (error) {
    console.error("Error in POST /api/admin/loyalty/rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, tier, reward_type, value, month, expires_at, is_active, product_id } = body

    const { data: reward, error } = await supabase
      .from("loyalty_rewards")
      .update({
        title,
        description,
        tier,
        reward_type,
        value: reward_type === "free_item" || value === "" ? null : value,
        month,
        expires_at,
        is_active,
        product_id: product_id || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating reward:", error)
      return NextResponse.json({ error: "Failed to update reward" }, { status: 500 })
    }

    if (is_active && reward.id) {
      try {
        const result = await assignRewardToTierUsers(reward.id, tier, month)
        console.log(`[v0] Assigned reward to ${result.assigned} users`)
      } catch (assignError) {
        console.error("[v0] Error assigning reward to users:", assignError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ reward })
  } catch (error) {
    console.error("Error in PUT /api/admin/loyalty/rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id)

    if (error) {
      console.error("Error deleting reward:", error)
      return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/loyalty/rewards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
