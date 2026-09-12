import type { Metadata } from "next"
import { DistributorDashboardClient } from "@/components/admin/distributor-dashboard-client"
import { requireDistributor } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "SAINT YVE® | Official Distribution Program - Dashboard",
}

export const dynamic = "force-dynamic"

export default async function DistributorDashboardPage() {
  const { user, profile } = await requireDistributor()

  return <DistributorDashboardClient userRole={profile.role} userEmail={user.email} />
}
