import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Suspense } from "react"
import { getDistributorSession } from "@/app/actions/distributor-auth"
import { createClient } from "@/lib/supabase/server"
import {
  CustomersClient,
  CustomersSkeleton,
  type DistributorCustomer,
} from "@/components/distributor/CustomersClient"

// ─── Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Customers | Distributor Portal | DESIGNERDRIP",
  description: "Private customer records. Restricted distributor access.",
}

// ─── Data Fetcher ───────────────────────────────────────────────────────────

async function fetchCustomers(distributorId: string): Promise<{
  customers: DistributorCustomer[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("distributor_customers")
      .select(
        "id, distributor, email, first_name, last_name, city, postal_code, street, country, phone, telegram_username, instagram_username, snapchat_username, created_at",
      )
      .eq("distributor", distributorId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[customers] Fetch error:", error)
      return { customers: [], error: error.message }
    }

    return { customers: (data as DistributorCustomer[]) ?? [] }
  } catch (err) {
    console.error("[customers] Unexpected error:", err)
    return { customers: [], error: "An unexpected error occurred." }
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) notFound()

  // Layout already guards session — secondary read for session data
  const session = await getDistributorSession()
  const partnerName =
    session?.company_name ||
    `${session?.first_name ?? ""} ${session?.last_name ?? ""}`.trim() ||
    "Partner"

  const distributorId = session?.id ?? slug

  const { customers, error } = await fetchCustomers(distributorId)

  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersClient
        distributorId={distributorId}
        partnerName={partnerName}
        initialCustomers={customers}
        error={error}
      />
    </Suspense>
  )
}
