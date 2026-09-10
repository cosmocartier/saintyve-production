"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { DistributorCustomersTable, type DistributorCustomer } from "@/components/admin/distributor-customers-table"
import { NewCustomerDistributor } from "@/components/admin/new-customer-distributor"

interface DistributorCustomersPageClientProps {
  distributorId: string
  initialCustomers: DistributorCustomer[]
}

export function DistributorCustomersPageClient({
  distributorId,
  initialCustomers,
}: DistributorCustomersPageClientProps) {
  const [customers, setCustomers] = useState<DistributorCustomer[]>(initialCustomers)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const fetchCustomers = useCallback(async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from("distributor_customers")
      .select("*")
      .eq("distributor", distributorId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCustomers(data as DistributorCustomer[])
    }
  }, [distributorId])

  const handleCustomerCreated = useCallback(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <>
      {/* Page header row */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">CUSTOMERS</h1>
          <p className="text-sm text-zinc-500 tracking-wide">Manage your customer accounts</p>
        </div>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium tracking-wide uppercase hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} />
          New Customer
        </button>
      </div>

      <DistributorCustomersTable customers={customers} />

      <NewCustomerDistributor
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        distributorId={distributorId}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  )
}
