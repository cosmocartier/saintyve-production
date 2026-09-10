import { StaticNavigation } from "@/components/static-navigation"
import { WishlistClient } from "@/components/wishlist/wishlist-client"
import { CartSidebar } from "@/components/cart-sidebar"

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <CartSidebar />
      <StaticNavigation />
      <div className="pt-20">
        <WishlistClient />
      </div>
    </div>
  )
}
