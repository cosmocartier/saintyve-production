import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import MembershipDetailClient from "@/components/admin/membership-detail-client"

export default async function MembershipDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch membership with profile data
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select(
      `
      *,
      profile:profiles(id, email, full_name, first_name, last_name)
    `,
    )
    .eq("id", params.id)
    .single()

  if (membershipError || !membership) {
    notFound()
  }

  // Fetch all rewards for this user
  const { data: rewards, error: rewardsError } = await supabase
    .from("loyalty_user_rewards")
    .select(
      `
      *,
      reward:loyalty_rewards(title, description, reward_type, value)
    `,
    )
    .eq("user_id", membership.user_id)
    .order("created_at", { ascending: false })

  return <MembershipDetailClient membership={membership} rewards={rewards || []} />
}
