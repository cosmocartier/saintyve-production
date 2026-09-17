import { StaticNavigation } from "@/components/static-navigation"
import { ChanelCategoryClient } from "@/components/brands/chanel-category-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getChanelProducts } from "@/lib/brands/chanel-products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Maxi Flap Bags | Saint Yve",
  description: "Discover the Chanel Maxi Flap Bag collection at Saint Yve.",
}

export default async function ChanelFlapBagsPage() {
  const products = await getChanelProducts()
  const filtered = products.filter((product: any) => /flap bag/i.test(product.model || ""))

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-20">
        <ChanelCategoryClient initialProducts={filtered} title="Maxi Flap Bags" />
      </div>

      <Footer />
    </div>
  )
}
