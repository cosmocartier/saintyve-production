import type { Metadata } from "next"
import { requireDistributor } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "DESIGNERDRIP® | Official Distribution Program - Customers",
}
import { DistributorSidebar } from "@/components/admin/distributor-sidebar"
import { DistributorCustomersPageClient } from "@/components/admin/distributor-customers-page-client"
import type { DistributorCustomer } from "@/components/admin/distributor-customers-table"

export const dynamic = "force-dynamic"

export default async function DistributorCustomersPage() {
  const { user, supabase, profile } = await requireDistributor()

  const { data: customers } = await supabase
    .from("distributor_customers")
    .select("*")
    .eq("distributor", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen bg-white">
      <DistributorSidebar userRole={profile.role} userEmail={user.email || ""} />

      <div className="flex-1 p-8">
        <DistributorCustomersPageClient
          distributorId={profile.id}
          initialCustomers={(customers as DistributorCustomer[]) ?? []}
        />
      </div>
    </div>
  )
}
