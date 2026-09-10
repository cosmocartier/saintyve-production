"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Search, Users, Lock } from "lucide-react"
import { CustomersTable, type Customer } from "./customers-table"
import { PrivateAccessTable, type PrivateAccessEntry } from "./private-access-table"

type ViewTab = "registered" | "private_access"

export function CustomersPageClient() {
  const [activeTab, setActiveTab] = useState<ViewTab>("registered")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [privateAccess, setPrivateAccess] = useState<PrivateAccessEntry[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingPrivateAccess, setLoadingPrivateAccess] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCustomers()
    fetchPrivateAccess()
  }, [])

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, orders (id, total)`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching customers:", error)
    } else if (data) {
      setCustomers(data)
    }
    setLoadingCustomers(false)
  }

  const fetchPrivateAccess = async () => {
    setLoadingPrivateAccess(true)

    const [{ data: emails, error: emailsError }, { data: tokens, error: tokensError }] = await Promise.all([
      supabase.from("newsletter_emails").select("*").eq("source", "private_access").order("created_at", { ascending: false }),
      supabase.from("registration_tokens").select("email, used"),
    ])

    if (emailsError) console.error("[v0] Error fetching private access entries:", emailsError)
    if (tokensError) console.error("[v0] Error fetching registration tokens:", tokensError)

    if (emails) {
      const tokenMap: Record<string, { exists: boolean; used: boolean }> = {}
      for (const t of tokens ?? []) {
        tokenMap[t.email] = { exists: true, used: t.used }
      }
      const enriched = emails.map((e) => ({
        ...e,
        token_sent: tokenMap[e.email]?.exists ?? false,
        token_used: tokenMap[e.email]?.used ?? false,
      }))
      setPrivateAccess(enriched)
    }

    setLoadingPrivateAccess(false)
  }

  const handleCustomerUpdated = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPrivateAccess = privateAccess.filter((e) =>
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: "registered",
      label: "Registered Clients",
      icon: <Users className="w-4 h-4" />,
      count: customers.length,
    },
    {
      id: "private_access",
      label: "Private Access List",
      icon: <Lock className="w-4 h-4" />,
      count: privateAccess.length,
    },
  ]

  return (
    <div className="flex-1 p-8 bg-[#0e0e0e] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25 mb-3">Management</p>
        <h1 className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90 mb-1">Customers</h1>
        <p className="font-sans text-[10px] tracking-wide text-white/30">
          Manage registered accounts and pending private access requests
        </p>
      </div>

      {/* Segment Toggle */}
      <div className="flex items-center gap-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm("") }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-[10px] font-medium tracking-[0.16em] uppercase transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/5 text-white/90"
                : "text-white/35 hover:bg-white/[0.03] hover:text-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-semibold transition-colors ${
                activeTab === tab.id ? "bg-white/10 text-white/70" : "bg-white/5 text-white/25"
              }`}
            >
              {tab.id === "registered" ? (loadingCustomers ? "—" : customers.length) : (loadingPrivateAccess ? "—" : privateAccess.length)}
            </span>
          </button>
        ))}
      </div>

      {/* Section description */}
      <div className="mb-5">
        {activeTab === "registered" ? (
          <p className="font-sans text-[10px] text-white/25 tracking-wide">
            Clients who have created an account and are actively using the platform.
          </p>
        ) : (
          <p className="font-sans text-[10px] text-white/25 tracking-wide">
            Clients who requested private access. Send invitations to allow them to register.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
        <input
          type="text"
          placeholder={activeTab === "registered" ? "Search by name or email..." : "Search by email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 font-sans text-[11px] text-white/70 placeholder:text-white/20 tracking-wide focus:outline-none focus:border-white/15 transition-colors"
        />
      </div>

      {/* Table */}
      {activeTab === "registered" ? (
        <CustomersTable
          customers={filteredCustomers}
          loading={loadingCustomers}
          onCustomerUpdated={handleCustomerUpdated}
        />
      ) : (
        <PrivateAccessTable
          entries={filteredPrivateAccess}
          loading={loadingPrivateAccess}
        />
      )}
    </div>
  )
}
