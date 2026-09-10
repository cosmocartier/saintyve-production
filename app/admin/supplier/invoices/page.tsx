"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { SupplierSidebar } from "@/components/admin/supplier-sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Edit, FileText } from "lucide-react"
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
}

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [editName, setEditName] = useState("")
  const [editProductPrices, setEditProductPrices] = useState<Record<string, string>>({})
  const [editPaid, setEditPaid] = useState(false)
  const [userRole, setUserRole] = useState<string>()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile) {
          setUserRole(profile.role)
        }
      }
    }

    fetchUserRole()
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

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setEditName(invoice.name)
    const prices: Record<string, string> = {}
    invoice.csv_data.forEach((order: any) => {
      order.order_items.forEach((item: any) => {
        const key = `${order.id}-${item.id}`
        prices[key] = (item.supplier_price || 0).toString()
      })
    })
    setEditProductPrices(prices)
    setEditPaid(invoice.paid || false)
  }

  const calculateTotalFromProducts = () => {
    if (!editingInvoice) return 0
    let total = 0
    editingInvoice.csv_data.forEach((order: any) => {
      order.order_items.forEach((item: any) => {
        const key = `${order.id}-${item.id}`
        const price = Number.parseFloat(editProductPrices[key] || "0")
        total += price * item.quantity
      })
    })
    return total
  }

  const handleProductPriceChange = (orderId: string, itemId: string, price: string) => {
    const key = `${orderId}-${itemId}`
    setEditProductPrices((prev) => ({ ...prev, [key]: price }))
  }

  const handleUpdate = async () => {
    if (!editingInvoice) return

    const updatedCsvData = editingInvoice.csv_data.map((order: any) => ({
      ...order,
      order_items: order.order_items.map((item: any) => {
        const key = `${order.id}-${item.id}`
        return {
          ...item,
          supplier_price: Number.parseFloat(editProductPrices[key] || "0"),
        }
      }),
    }))

    const totalPrice = calculateTotalFromProducts()

    const updateData: any = {
      name: editName,
      total_price: totalPrice,
      csv_data: updatedCsvData,
      paid: editPaid,
    }

    if (editPaid && !editingInvoice.paid) {
      updateData.payment_date = new Date().toISOString()
    } else if (!editPaid && editingInvoice.paid) {
      updateData.payment_date = null
    }

    const { error } = await supabase.from("supplier_invoices").update(updateData).eq("id", editingInvoice.id)

    if (error) {
      console.error("[v0] Error updating invoice:", error)
      alert("Failed to update invoice")
      return
    }

    setEditingInvoice(null)
    setEditName("")
    setEditProductPrices({})
    setEditPaid(false)
    fetchInvoices()
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("INVOICE", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Invoice: ${invoice.name}`, 20, 35)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 42)
    doc.text(`Total: €${invoice.total_price?.toFixed(2) || "0.00"}`, 20, 49)
    doc.text(`Status: ${invoice.paid ? "PAID" : "UNPAID"}`, 20, 56)
    if (invoice.payment_date) {
      doc.text(`Paid on: ${new Date(invoice.payment_date).toLocaleDateString()}`, 20, 63)
    }

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
          `€${Number(item.price).toFixed(2)}`,
          `€${Number(item.supplier_price || 0).toFixed(2)}`,
        ])
      })
    })

    autoTable(doc, {
      startY: invoice.payment_date ? 70 : 63,
      head: [["Order ID", "Customer", "Product", "Size", "Color", "Qty", "Price", "Supplier Price"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    })

    doc.save(`${invoice.name.replace(/\s+/g, "_")}_${new Date(invoice.created_at).toISOString().split("T")[0]}.pdf`)
  }

  const handleDownloadCSV = (invoice: Invoice) => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Postal Code",
      "Country",
      "Product",
      "Size",
      "Color",
      "Quantity",
      "Price",
      "Supplier Price",
      "Order Date",
    ]

    const rows = invoice.csv_data.flatMap((order: any) =>
      order.order_items.map((item: any) => [
        order.id.slice(0, 8).toUpperCase(),
        order.shipping_address?.fullName || order.profiles?.full_name || order.customer_name || "N/A",
        order.shipping_address?.phone || "N/A",
        `${order.shipping_address?.address || ""} ${order.shipping_address?.apartment || ""}`.trim(),
        order.shipping_address?.city || "N/A",
        order.shipping_address?.postalCode || "N/A",
        order.shipping_address?.country || "N/A",
        item.products?.name || "N/A",
        item.product_variants?.size || "N/A",
        item.product_variants?.color || "N/A",
        item.quantity,
        `€${Number(item.price).toFixed(2)}`,
        `€${Number(item.supplier_price || 0).toFixed(2)}`,
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
      <SupplierSidebar userRole={userRole} />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-2">INVOICES</h1>
          <p className="text-sm text-zinc-500 tracking-wide">View and manage your exported invoices</p>
        </div>

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
                      No invoices found. Export orders from the dashboard to create invoices.
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
                        {invoice.total_price ? `€${Number(invoice.total_price).toFixed(2)}` : "Not set"}
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
                            onClick={() => handleEdit(invoice)}
                            className="rounded-none text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
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

      <Dialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="tracking-widest uppercase">Edit Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs tracking-widest uppercase">
                Invoice Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-none border-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase">Product Prices</Label>
              <div className="border border-black/10 rounded-none max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Order ID</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Variant</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest uppercase">Supplier Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {editingInvoice?.csv_data.flatMap((order: any) =>
                      order.order_items.map((item: any) => {
                        const key = `${order.id}-${item.id}`
                        return (
                          <tr key={key}>
                            <td className="px-4 py-2 text-xs font-mono">#{order.id.slice(0, 8)}</td>
                            <td className="px-4 py-2">{item.products?.name || "N/A"}</td>
                            <td className="px-4 py-2 text-xs text-zinc-500">
                              {item.product_variants?.size || "N/A"} / {item.product_variants?.color || "N/A"}
                            </td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={editProductPrices[key] || ""}
                                onChange={(e) => handleProductPriceChange(order.id, item.id, e.target.value)}
                                className="w-24 h-8 rounded-none border-black text-sm"
                              />
                            </td>
                          </tr>
                        )
                      }),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium tracking-widest uppercase">Calculated Total:</span>
                <span className="text-xl font-medium">€{calculateTotalFromProducts().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-paid"
                checked={editPaid}
                onCheckedChange={(checked) => setEditPaid(checked as boolean)}
                className="rounded-none"
              />
              <Label htmlFor="edit-paid" className="text-xs tracking-widest uppercase cursor-pointer">
                Mark as Paid
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInvoice(null)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="rounded-none">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
