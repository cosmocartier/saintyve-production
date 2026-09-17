import { StaticNavigation } from "@/components/static-navigation"
import { ChanelCategoryClient } from "@/components/brands/chanel-category-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getChanelProducts } from "@/lib/brands/chanel-products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chanel Vanity | Saint Yve",
  description: "Discover the Chanel Vanity collection at Saint Yve.",
}

export default async function ChanelVanityPage() {
  const products = await getChanelProducts()
  const filtered = products.filter((product: any) => /\bvanity\b/i.test(product.model || ""))

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <ChanelCategoryClient initialProducts={filtered} title="Vanity" />
      </div>

      <Footer />
    </div>
  )
}
