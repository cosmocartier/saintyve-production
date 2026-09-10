"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown } from "lucide-react"

export interface DistributorCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  city: string | null
  postal_code: string | null
  street: string | null
  country: string | null
  phone: string | null
  distributor: string | null
  telegram_username: string | null
  instagram_username: string | null
  snapchat_username: string | null
  created_at: string
}

interface DistributorCustomersTableProps {
  customers: DistributorCustomer[]
}

export function DistributorCustomersTable({ customers }: DistributorCustomersTableProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers

    const query = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(query) ||
        c.last_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.city ?? "").toLowerCase().includes(query) ||
        (c.country ?? "").toLowerCase().includes(query) ||
        (c.phone ?? "").toLowerCase().includes(query),
    )
  }, [customers, searchQuery])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(filteredCustomers.map((c) => c.id)))
    } else {
      setSelectedCustomers(new Set())
    }
  }

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers)
    if (checked) {
      newSelected.add(customerId)
    } else {
      newSelected.delete(customerId)
    }
    setSelectedCustomers(newSelected)
  }

  const isAllSelected =
    filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedCustomers.has(c.id))
  const isSomeSelected = selectedCustomers.size > 0 && !isAllSelected

  return (
    <div className="space-y-6">
      {/* Bulk Action Frame */}
      {selectedCustomers.size > 0 && (
        <div className="border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-600">
            {selectedCustomers.size} CUSTOMER{selectedCustomers.size !== 1 ? "S" : ""} SELECTED
          </p>
          <div className="relative">
            <button
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:border-black hover:bg-black hover:text-white transition-colors"
            >
              Bulk actions
              <ChevronDown size={16} />
            </button>

            {bulkActionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBulkActionsOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-lg z-20">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors">
                      Export selected
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Field */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          size={18}
        />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-zinc-200 bg-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="w-12 p-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 border-zinc-300 bg-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                    style={{ accentColor: "black" }}
                  />
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Name</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Email</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Phone</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">City</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Postal Code</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Street</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-xs font-medium tracking-wide uppercase text-zinc-500">Country</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-sm text-zinc-400">
                    {customers.length === 0
                      ? "No customers yet. Create your first customer using the button above."
                      : "No customers match your search."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-zinc-50 transition-colors ${selectedCustomers.has(customer.id) ? "bg-zinc-50" : ""}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                        className="w-4 h-4 border-zinc-300 bg-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                        style={{ accentColor: "black" }}
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-zinc-900">
                        {customer.first_name} {customer.last_name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.phone ?? "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.city ?? "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.postal_code ?? "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.street ?? "—"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-600">{customer.country ?? "—"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Count */}
      <div className="text-sm text-zinc-500">
        Showing {filteredCustomers.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
