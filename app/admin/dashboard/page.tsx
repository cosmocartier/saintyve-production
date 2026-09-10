import { requireAdmin } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileSidebarSheet } from "@/components/admin/admin-mobile-sidebar-sheet"
import { DashboardContent } from "@/components/admin/dashboard-content"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin()

  const [ordersResult, recentOrdersResult] = await Promise.all([
    supabase.from("orders").select("id, total, status, payment_method, created_at, updated_at"),
    supabase
      .from("orders")
      .select(
        `
        *,
        profiles (
          email,
          full_name
        ),
        order_items (
          quantity,
          price
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const orders = ordersResult.data || []
  const recentOrders = recentOrdersResult.data || []

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
        aria-hidden
      />

      {/* Top Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-white/6">
        <div
          className="relative px-5 py-4 sm:px-8"
          style={{
            backgroundColor: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
            {/* Left: mobile menu + wordmark */}
            <div className="flex items-center gap-4">
              {/* Mobile sidebar trigger */}
              <div className="lg:hidden">
                <AdminMobileSidebarSheet userEmail={user.email || ""} />
              </div>

              <Link
                href="/"
                className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-white/90 transition-colors hover:text-white"
              >
                DESIGNERDRIP
              </Link>
            </div>

            {/* Right: portal badge + home link */}
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
                <span className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">
                  Admin Portal
                </span>
              </div>
              <Link
                href="/"
                className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-white/55"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="relative z-10 mx-auto flex max-w-screen-xl gap-6 px-5 py-8 sm:px-8 lg:gap-8">
        {/* Desktop sidebar */}
        <div className="hidden w-[280px] shrink-0 self-start lg:block">
          <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto">
            <AdminSidebar userEmail={user.email || ""} />
          </div>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <DashboardContent orders={orders} recentOrders={recentOrders} />
        </main>
      </div>
    </div>
  )
}
