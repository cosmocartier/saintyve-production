import { requireSupplier } from "@/lib/admin-auth"
import { SupplierTrackingClient } from "@/components/admin/supplier-tracking-client"

export const dynamic = "force-dynamic"

export default async function SupplierTrackingPage() {
  const { supabase, profile } = await requireSupplier()

  if (!profile) {
    return <div>Error: Unable to load profile</div>
  }

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
        tracking_number,
        courier,
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
    .in("status", ["processing", "completed"])
    .in("supplier_status", ["in_transit", "delivered"])
    .order("created_at", { ascending: false })

  return <SupplierTrackingClient initialOrders={orders || []} supplierId={profile.id} userRole={profile.role} />
}
