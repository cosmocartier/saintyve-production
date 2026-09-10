import { notFound } from "next/navigation"
import { getDistributorSession } from "@/app/actions/distributor-auth"
import { DashboardClient } from "@/components/distributor/DashboardClient"

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DistributorDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) notFound()

  // Layout already guards session — this is a secondary read to get the name
  const session = await getDistributorSession()
  const partnerName =
    session?.company_name ||
    `${session?.first_name ?? ""} ${session?.last_name ?? ""}`.trim() ||
    "Partner"

  return <DashboardClient partnerName={partnerName} />
}
