import { SupplierDashboardClient } from "@/components/admin/supplier-dashboard-client"
import { requireSupplier } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function SupplierDashboardPage() {
  const { user, supabase, profile } = await requireSupplier()

  // Fetch initial orders data on the server
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles (
        email,
        full_name
      ),
      order_items (
        id,
        quantity,
        price,
        product_id,
        variant_id,
        products (
          name
        ),
        product_variants (
          size,
          color
        )
      )
    `,
    )
    .eq("status", "processing")
    .order("created_at", { ascending: false })

  return <SupplierDashboardClient initialOrders={orders || []} supplierId={user.id} userRole={profile.role} />
}
