import { requireSupplier } from "@/lib/admin-auth"
import { notFound } from "next/navigation"
import { SupplierCaseDetailClient } from "@/components/admin/supplier-case-detail-client"

export const dynamic = "force-dynamic"

export default async function SupplierCaseDetailPage({ params }: { params: { case_id: string } }) {
  const { supabase } = await requireSupplier()

  const { data: caseData, error } = await supabase
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
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        payment_method,
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
    .eq("id", params.case_id)
    .single()

  if (error || !caseData) {
    notFound()
  }

  // Fetch order items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(
      `
      *,
      products (
        id,
        name,
        slug
      ),
      product_variants (
        id,
        size,
        color
      )
    `,
    )
    .eq("order_id", caseData.order_id)

  const { data: resolution } = await supabase
    .from("investigation_case_resolutions")
    .select("*")
    .eq("case_id", params.case_id)
    .single()

  return <SupplierCaseDetailClient caseData={caseData} orderItems={orderItems || []} customerResolution={resolution} />
}
