"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { distributorLogout } from "@/app/actions/distributor-auth"

// ─── Helpers ───────────────────────────────────────────────────────────────

/** @deprecated Use the partnerName prop instead. Kept for external compatibility. */
export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// ─── Nav links ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Overview", href: "" },
  { label: "Orders", href: "/orders" },
  { label: "Inventory", href: "/inventory" },
  { label: "Customers", href: "/customers" },
  { label: "Payouts", href: "/payouts" },
  { label: "Support", href: "/support" },
  { label: "Settings", href: "/settings" },
] as const

// ─── Component ─────────────────────────────────────────────────────────────

interface DistributorSidebarProps {
  slug: string
  partnerName: string
}

export function DistributorSidebar({ slug, partnerName }: DistributorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    const full = `/distributor/${slug}${href}`
    if (href === "") {
      return pathname === `/distributor/${slug}`
    }
    return pathname.startsWith(full)
  }

  async function handleLogout() {
    await distributorLogout()
    router.push("/distributor/login")
    router.refresh()
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-full flex-col rounded-2xl border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      style={{ backgroundColor: "#131313" }}
    >
      {/* ── Partner Identity ─────────────────────────────────────────── */}
      <div className="px-6 pb-6 pt-7">
        <div className="space-y-3">
          {/* Verified badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D6C7A1]/15 bg-[#D6C7A1]/5 px-2.5 py-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#D6C7A1]/50"
              aria-hidden
            />
            <span className="font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-[#D6C7A1]/70">
              Verified Partner
            </span>
          </div>

          {/* Partner name */}
          <h2 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90">
            {partnerName}
          </h2>

          {/* Subline */}
          <p className="font-sans text-[10px] font-light tracking-wide text-white/30">
            Distribution Access Granted
          </p>
        </div>

        <Separator className="mt-6 bg-white/6" />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pb-3" aria-label="Distributor navigation">
        <ul className="space-y-0.5">
          {NAV_LINKS.map((link, i) => {
            const active = isActive(link.href)
            return (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.08 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/distributor/${slug}${link.href}`}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                    active
                      ? "bg-white/5 text-white/90"
                      : "text-white/45 hover:bg-white/[0.03] hover:text-white/70",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {/* Active gold indicator */}
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                      active ? "bg-[#D6C7A1]/70 opacity-100" : "opacity-0",
                    ].join(" ")}
                    aria-hidden
                  />

                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.18em]">
                    {link.label}
                  </span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="px-6 pb-6 pt-4">
        <Separator className="mb-5 bg-white/6" />
        <div className="flex flex-col gap-3">
          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-white/18">
            All actions are logged.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-white/8 bg-transparent px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/30 transition-all duration-200 hover:border-white/12 hover:text-white/55"
          >
            Log Out
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
