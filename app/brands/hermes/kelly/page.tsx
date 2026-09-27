import { StaticNavigation } from "@/components/static-navigation"
import { ChanelCategoryClient } from "@/components/brands/chanel-category-client"
import { CartSidebar } from "@/components/cart-sidebar"
import { Footer } from "@/components/footer"
import { getHermesProducts } from "@/lib/brands/hermes-products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kelly | Saint Yve",
  description: "Discover the Hermès Kelly collection at Saint Yve.",
}

export default async function HermesKellyPage() {
  const products = await getHermesProducts()
  const filtered = products.filter((product: any) => /\bkelly\b/i.test(product.model || ""))

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />

      <div className="pt-12 md:pt-14 lg:pt-20">
        <ChanelCategoryClient initialProducts={filtered} title="Kelly" />
      </div>

      <Footer />
    </div>
  )
}
