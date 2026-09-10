"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Tag,
  Coins,
  ChevronDown,
  ShoppingBag,
  AlertTriangle,
  FolderTree,
  MessageSquare,
  FileText,
  User,
  Award,
  CheckSquare,
  Network,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navigationSections = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: FolderTree },
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Memberships", href: "/admin/memberships", icon: Award },
      { name: "Requests", href: "/admin/requests", icon: MessageSquare },
      { name: "Credits", href: "/admin/credits", icon: Coins },
      { name: "Coupons", href: "/admin/coupons", icon: Tag },
      { name: "Loyalty", href: "/admin/loyalty/monthly-rewards", icon: Award },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "FULFILLMENT",
    items: [
      { name: "Investigations", href: "/admin/investigations", icon: AlertTriangle },
      { name: "Invoices", href: "/admin/invoices", icon: FileText },
    ],
  },
]

type AdminSidebarProps = {
  userEmail?: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="w-64 min-w-[256px] shrink-0 sticky top-0 h-screen p-3" style={{ backgroundColor: "#0e0e0e" }}>
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-full flex-col rounded-2xl border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-y-auto"
      style={{ backgroundColor: "#131313" }}
    >
      {/* ── Identity header ───────────────────────────────────────────── */}
      <div className="px-6 pb-6 pt-7">
        <div className="space-y-3">
          {/* Portal badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
            <span className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">
              Admin Portal
            </span>
          </div>

          {/* Portal switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full text-left hover:opacity-80 transition-opacity focus:outline-none">
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90">ADMIN</h1>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </div>
              <p className="font-sans text-[10px] font-light tracking-wide text-white/30 mt-1">Admin Access Granted</p>
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
        </div>

        <Separator className="mt-6 bg-white/6" />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pb-3" aria-label="Admin navigation">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.label} className={sectionIndex > 0 ? "mt-6" : ""}>
            <div className="px-3 mb-2">
              <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">
                {section.label}
              </p>
            </div>

            <ul className="space-y-0.5">
              {section.items.map((item, i) => {
                const active = pathname === item.href
                const Icon = item.icon

                return (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.08 + i * 0.03,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      className={[
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                        active
                          ? "bg-white/5 text-white/90"
                          : "text-white/45 hover:bg-white/[0.03] hover:text-white/70",
                      ].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {/* Active indicator */}
                      <span
                        className={[
                          "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                          active ? "bg-white/40 opacity-100" : "opacity-0",
                        ].join(" ")}
                        aria-hidden
                      />

                      <Icon className="w-[11px] h-[11px] flex-shrink-0 opacity-70" />

                      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em]">
                        {item.name}
                      </span>
                    </Link>
                  </motion.li>
                )
              })}
            </ul>

            {sectionIndex < navigationSections.length - 1 && (
              <Separator className="mt-5 bg-white/5" />
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────��─────────────────────────────── */}
      <div className="px-6 pb-6 pt-4">
        <Separator className="mb-5 bg-white/6" />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8">
              <User className="w-3.5 h-3.5 text-white/50" />
            </div>
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/30 truncate">
              {userEmail || "Admin"}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg border border-white/8 bg-transparent px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 transition-all duration-200 hover:border-white/12 hover:text-white/55 flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </motion.aside>
    </div>
  )
}
