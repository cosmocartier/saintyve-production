"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Invoice = {
  id: string
  name: string
  total_price: number | null
  order_ids: string[]
  csv_data: any
  created_at: string
  updated_at: string
  paid: boolean
  payment_date: string | null
  supplier_id: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("supplier_invoices")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPaidDialogOpen(true)
  }

  const handleUpdatePaidStatus = async (paid: boolean) => {
    if (!selectedInvoice) return

    const updateData: any = {
      paid,
    }

    if (paid && !selectedInvoice.paid) {
      updateData.payment_date = new Date().toISOString()
    } else if (!paid && selectedInvoice.paid) {
      updateData.payment_date = null
    }

    const { error } = await supabase.from("supplier_invoices").update(updateData).eq("id", selectedInvoice.id)

    if (error) {
      console.error("[v0] Error updating invoice:", error)
      alert("Failed to update invoice")
      return
    }

    setIsPaidDialogOpen(false)
    setSelectedInvoice(null)
    fetchInvoices()
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("INVOICE", 105, 20, { align: "center" })

    // Invoice details
    doc.setFontSize(10)
    doc.text(`Invoice: ${invoice.name}`, 20, 35)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 42)
    doc.text(`Total: $${invoice.total_price?.toFixed(2) || "0.00"}`, 20, 49)
    doc.text(`Status: ${invoice.paid ? "PAID" : "UNPAID"}`, 20, 56)
    if (invoice.payment_date) {
      doc.text(`Paid on: ${new Date(invoice.payment_date).toLocaleDateString()}`, 20, 63)
    }

    // Prepare table data
    const tableData: any[] = []
    invoice.csv_data.forEach((order: any) => {
      order.order_items.forEach((item: any) => {
        tableData.push([
          order.id.slice(0, 8).toUpperCase(),
          order.profiles?.full_name || "N/A",
          item.products?.name || "N/A",
          item.product_variants?.size || "N/A",
          item.product_variants?.color || "N/A",
          item.quantity.toString(),
          `$${Number(item.price).toFixed(2)}`,
          `$${Number(item.supplier_price || 0).toFixed(2)}`,
        ])
      })
    })

    // Add table
    autoTable(doc, {
      startY: invoice.payment_date ? 70 : 63,
      head: [["Order ID", "Customer", "Product", "Size", "Color", "Qty", "Price", "Supplier Price"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    })

    // Save PDF
    doc.save(`${invoice.name.replace(/\s+/g, "_")}_${new Date(invoice.created_at).toISOString().split("T")[0]}.pdf`)
  }

  const handleDownloadCSV = (invoice: Invoice) => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Phone",
      "Address",
      "City",
      "Postal Code",
      "Country",
      "Product",
      "Size",
      "Color",
      "Quantity",
      "Customer Price",
      "Supplier Price",
      "Order Date",
    ]

    const rows = invoice.csv_data.flatMap((order: any) =>
      order.order_items.map((item: any) => [
        order.id,
        order.profiles?.full_name || "N/A",
        order.profiles?.email || "N/A",
        order.shipping_address?.phone || "N/A",
        `${order.shipping_address?.address || ""} ${order.shipping_address?.apartment || ""}`.trim(),
        order.shipping_address?.city || "N/A",
        order.shipping_address?.postalCode || "N/A",
        order.shipping_address?.country || "N/A",
        item.products?.name || "N/A",
        item.product_variants?.size || "N/A",
        item.product_variants?.color || "N/A",
        item.quantity,
        `$${Number(item.price).toFixed(2)}`,
        `$${Number(item.supplier_price || 0).toFixed(2)}`,
        new Date(order.created_at).toLocaleDateString(),
      ]),
    )

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${invoice.name.replace(/\s+/g, "_")}_${new Date(invoice.created_at).toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">INVOICES</h1>
          <p className="text-sm text-zinc-500 tracking-wide">View and manage all supplier invoices</p>
        </div>

        {/* Invoices List */}
        <div className="border border-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">INVOICE NAME</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">ORDERS</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">TOTAL PRICE</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">CREATED</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">PAID</th>
                  <th className="px-6 py-4 text-left text-xs tracking-widest uppercase text-zinc-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-400" />
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="text-sm font-medium hover:underline text-left"
                          >
                            {invoice.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{invoice.order_ids.length} orders</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {invoice.total_price ? `$${Number(invoice.total_price).toFixed(2)}` : "Not set"}
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(invoice.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs tracking-widest uppercase ${
                            invoice.paid
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          {invoice.paid ? "PAID" : "UNPAID"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(invoice)}
                            className="rounded-none text-xs"
                          >
                            Mark as {invoice.paid ? "Unpaid" : "Paid"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadCSV(invoice)}
                            className="rounded-none text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={isPaidDialogOpen} onOpenChange={setIsPaidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="tracking-widest uppercase">Update Payment Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-600 mb-4">
              Are you sure you want to mark this invoice as {selectedInvoice?.paid ? "unpaid" : "paid"}?
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm-paid"
                checked={!selectedInvoice?.paid}
                onCheckedChange={() => {}}
                className="rounded-none"
              />
              <Label htmlFor="confirm-paid" className="text-xs tracking-widest uppercase">
                Mark as {selectedInvoice?.paid ? "Unpaid" : "Paid"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaidDialogOpen(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={() => handleUpdatePaidStatus(!selectedInvoice?.paid)} className="rounded-none">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
