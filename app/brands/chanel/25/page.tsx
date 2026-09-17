import { StaticNavigation } from "@/components/static-navigation"
import { ChanelCategoryClient } from "@/components/brands/chanel-category-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getChanelProducts } from "@/lib/brands/chanel-products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chanel 25 | Saint Yve",
  description: "Discover the Chanel 25 handbag collection at Saint Yve.",
}

export default async function Chanel25Page() {
  const products = await getChanelProducts()
  const filtered = products.filter((product: any) => /\b25\b/.test(product.model || ""))

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <ChanelCategoryClient initialProducts={filtered} title="Chanel 25" />
      </div>

      <Footer />
    </div>
  )
}
