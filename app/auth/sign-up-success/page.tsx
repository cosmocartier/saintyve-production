import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"

export default function SignUpSuccessPage() {
  return (
    <>
      <StaticNavigation />
      <CartSidebar />
      <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-widest uppercase mb-4">CHECK YOUR EMAIL</h1>
            <p className="text-sm text-zinc-600 tracking-wide mb-2">We've sent you a confirmation email.</p>
            <p className="text-sm text-zinc-600 tracking-wide">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="bg-black text-white hover:bg-zinc-800 rounded-none text-xs font-medium tracking-widest uppercase px-8 py-6">
              BACK TO SIGN IN
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
