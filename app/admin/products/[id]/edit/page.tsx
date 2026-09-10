import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import EditProductForm from "@/components/admin/management/products/edit-product/edit-product-form"
import Link from "next/link"
import { requireAdmin } from "@/lib/admin-auth"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { user } = await requireAdmin()

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (
        id,
        url,
        display_order,
        alt_text,
        color_name,
        color_hex
      ),
      product_variants (
        id,
        sku,
        size,
        color,
        stock_quantity,
        price_adjustment
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (productError || !product) {
    redirect("/admin/products")
  }

  const { data: cfImages } = await supabase
    .from("product_images_cf")
    .select("*")
    .eq("product_id", params.id)
    .order("sort_order", { ascending: true })

  const { data: factoryMedia } = await supabase
    .from("product_factory_media")
    .select("*")
    .eq("product_id", params.id)
    .order("sort_order", { ascending: true })

  const sortedImages = product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || []

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <AdminSidebar userEmail={user.email || ""} />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-white/30 hover:text-white/60 mb-5 transition-colors"
          >
            &larr; Back to Products
          </Link>

          <div>
            <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management</p>
            <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">
              Edit Product
            </h1>
            <p className="font-sans text-[10px] tracking-wide text-white/30">
              Update product details, images, and variants
            </p>
          </div>
        </div>

        <EditProductForm
          product={{ ...product, product_images: sortedImages }}
          cfImages={cfImages || []}
          factoryMedia={factoryMedia || []}
        />
      </div>
    </div>
  )
}
