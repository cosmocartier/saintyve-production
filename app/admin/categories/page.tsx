import { requireAdmin } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CategoriesClient } from "@/components/admin/categories-client"

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin()

  // Fetch all categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">CATEGORIES</h1>
          <p className="text-sm text-zinc-500 tracking-wide">Manage your product categories and subcategories</p>
        </div>

        <CategoriesClient initialCategories={categories || []} />
      </div>
    </div>
  )
}
