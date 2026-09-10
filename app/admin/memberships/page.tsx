import { createClient } from "@/lib/supabase/server"
import MembershipsClient from "@/components/admin/memberships-client"

export default async function MembershipsPage() {
  const supabase = await createClient()

  const { data: memberships, error } = await supabase
    .from("memberships")
    .select(
      `
      *,
      profile:profiles!memberships_user_id_fkey (
        id,
        email,
        full_name,
        first_name,
        last_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching memberships:", error)
  }

  return <MembershipsClient initialMemberships={memberships || []} />
}
