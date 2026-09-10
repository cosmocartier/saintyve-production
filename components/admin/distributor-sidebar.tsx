"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Truck,
  LogOut,
  ChevronDown,
  ShoppingCart,
  User,
  Network,
  Users,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navigationSections = [
  {
    label: "WORKSPACE",
    items: [{ name: "Dashboard", href: "/admin/distributor", icon: LayoutDashboard }],
  },
  {
    label: "DISTRIBUTION",
    items: [
      { name: "Orders", href: "/admin/distributor/orders", icon: ShoppingCart },
      { name: "Products", href: "/admin/distributor/products", icon: Package },
      { name: "Customers", href: "/admin/distributor/customers", icon: Users },
      { name: "Tracking", href: "/admin/distributor/tracking", icon: Truck },
    ],
  },
]

type DistributorSidebarProps = {
  userRole?: string
  userEmail?: string
}

export function DistributorSidebar({ userRole, userEmail }: DistributorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = userRole === "admin"

  return (
    <div className="w-72 bg-zinc-950 text-white sticky top-0 h-screen flex flex-col overflow-y-auto border-r border-white/10">
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        {isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full text-left hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl tracking-[0.15em] uppercase mb-1 font-medium">DISTRIBUTOR</h1>
                  <p className="text-xs text-zinc-400 tracking-wide">Distributor Dashboard</p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-950 text-white border-white/20">
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => router.push("/admin/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => router.push("/admin/supplier")}
              >
                <Package className="w-4 h-4 mr-2" />
                Supplier Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => router.push("/admin/distributor")}
              >
                <Network className="w-4 h-4 mr-2" />
                Distributor Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div>
            <h1 className="text-2xl font-medium tracking-[0.15em] uppercase mb-1">DISTRIBUTOR</h1>
            <p className="text-xs text-zinc-400 tracking-wide">Distributor Dashboard</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.label}>
            <div className="px-3 mb-3">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">{section.label}</p>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium
                      transition-all duration-200
                      ${isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full" />
                    )}

                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />

                    <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {sectionIndex < navigationSections.length - 1 && <div className="mt-6 mx-3 h-px bg-white/5" />}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userEmail || "Distributor"}</p>
            <p className="text-xs text-zinc-500 truncate">Official Partner</p>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
                     text-sm font-medium tracking-wide uppercase
                     bg-transparent border border-white/20 text-white
                     hover:bg-white hover:text-black transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
