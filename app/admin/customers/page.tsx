import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CustomersPageClient } from "@/components/admin/customers/customers-page-client"

export default function AdminCustomersPage() {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        <CustomersPageClient />
      </div>
    </div>
  )
}
