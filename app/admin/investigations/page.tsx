import { requireAdmin } from "@/lib/admin-auth"
import { AdminInvestigationsClient } from "@/components/admin/admin-investigations-client"

export const dynamic = "force-dynamic"

export default async function AdminInvestigationsPage() {
  const { supabase, user } = await requireAdmin()

  // Fetch investigation cases with related data
  const { data: cases } = await supabase
    .from("investigation_cases")
    .select(
      `
      *,
      orders (
        id,
        created_at,
        total,
        status,
        supplier_status,
        profiles (
          email,
          full_name
        )
      ),
      created_by_profile:profiles!investigation_cases_created_by_fkey (
        email,
        full_name,
        role
      ),
      assigned_to_profile:profiles!investigation_cases_assigned_to_fkey (
        email,
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  return <AdminInvestigationsClient initialCases={cases || []} currentUserId={user.id} userRole="admin" />
}
