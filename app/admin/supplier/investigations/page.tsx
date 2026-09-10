import { requireSupplier } from "@/lib/admin-auth"
import { SupplierInvestigationsClient } from "@/components/admin/supplier-investigations-client"

export const dynamic = "force-dynamic"

export default async function SupplierInvestigationsPage() {
  const { supabase, user, profile } = await requireSupplier()

  // Fetch investigation cases
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

  return <SupplierInvestigationsClient initialCases={cases || []} currentUserId={user.id} userRole={profile.role} />
}
