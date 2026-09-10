import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import NewProductForm from "@/components/admin/management/products/new-product/new-product-form"

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const categoryId = searchParams.category
  let categoryInfo = null

  if (categoryId) {
    const { data: category } = await supabase.from("categories").select("*").eq("id", categoryId).single()
    categoryInfo = category
  }

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <AdminSidebar userEmail={user.email || ""} />

      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management / Products</p>
          <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">
            {categoryInfo ? `Add Product to ${categoryInfo.name}` : "Create New Product"}
          </h1>
          <p className="font-sans text-[10px] tracking-wide text-white/30">
            {categoryInfo
              ? `Add a new product to the ${categoryInfo.name} category`
              : "Add a new product to your catalog"}
          </p>
        </div>

        <NewProductForm preselectedCategoryId={categoryId} />
      </div>
    </div>
  )
}
