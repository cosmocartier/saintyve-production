"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit2, Trash2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const TIERS = ["bronze", "silver", "gold", "platinum", "black"]
const REWARD_TYPES = ["discount", "credits", "free_shipping", "exclusive_access", "free_item", "other"]

type Reward = {
  id: string
  title: string
  description: string
  tier: string
  reward_type: string
  value: string
  month: string
  expires_at: string
  is_active: boolean
  created_at: string
  product_id?: string
}

type Product = {
  id: string
  name: string
  slug: string
  price: number
  category: string
  brand: string
}

export default function MonthlyRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [selectedTier, setSelectedTier] = useState<string>("bronze")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [productSearch, setProductSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tier: "bronze",
    reward_type: "discount",
    value: "",
    month: selectedMonth,
    expires_at: "",
    is_active: true,
    product_id: "",
  })

  useEffect(() => {
    fetchUserEmail()
    fetchRewards()
  }, [selectedMonth, selectedTier])

  const fetchUserEmail = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email) {
      setUserEmail(user.email)
    }
  }

  const fetchRewards = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedMonth) params.append("month", selectedMonth)
    if (selectedTier) params.append("tier", selectedTier)

    const response = await fetch(`/api/admin/loyalty/rewards?${params.toString()}`)
    const data = await response.json()

    if (response.ok) {
      setRewards(data.rewards || [])
    }
    setLoading(false)
  }

  const handleGenerateRewards = async () => {
    if (!confirm("This will assign monthly rewards to all eligible users. Continue?")) return

    setIsGenerating(true)
    const response = await fetch("/api/loyalty/assign-monthly-rewards", {
      method: "POST",
    })

    if (response.ok) {
      alert("Monthly rewards generated successfully!")
      fetchRewards()
    } else {
      alert("Failed to generate rewards")
    }
    setIsGenerating(false)
  }

  const searchProducts = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, category, brand")
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(10)

    if (!error && data) {
      setSearchResults(data)
    }
    setIsSearching(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.reward_type === "free_item") {
        searchProducts(productSearch)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [productSearch, formData.reward_type])

  const handleOpenModal = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward)
      setFormData({
        title: reward.title,
        description: reward.description,
        tier: reward.tier,
        reward_type: reward.reward_type,
        value: reward.value,
        month: reward.month,
        expires_at: reward.expires_at,
        is_active: reward.is_active,
        product_id: reward.product_id || "",
      })

      if (reward.reward_type === "free_item" && reward.product_id) {
        const fetchProduct = async () => {
          const supabase = createClient()
          const { data } = await supabase
            .from("products")
            .select("id, name, slug, price, category, brand")
            .eq("id", reward.product_id)
            .single()

          if (data) {
            setSelectedProduct(data)
          }
        }
        fetchProduct()
      }
    } else {
      setEditingReward(null)
      setFormData({
        title: "",
        description: "",
        tier: "bronze",
        reward_type: "discount",
        value: "",
        month: selectedMonth,
        expires_at: "",
        is_active: true,
        product_id: "",
      })
      setSelectedProduct(null)
      setProductSearch("")
      setSearchResults([])
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingReward(null)
    setSelectedProduct(null)
    setProductSearch("")
    setSearchResults([])
  }

  const handleSaveReward = async () => {
    if (formData.reward_type === "free_item" && !formData.product_id) {
      alert("Please select a product for the free item reward")
      return
    }

    const method = editingReward ? "PUT" : "POST"
    const body = editingReward ? { ...formData, id: editingReward.id } : formData

    const response = await fetch("/api/admin/loyalty/rewards", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      fetchRewards()
      handleCloseModal()
    } else {
      alert("Failed to save reward")
    }
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return

    const response = await fetch(`/api/admin/loyalty/rewards?id=${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      fetchRewards()
    } else {
      alert("Failed to delete reward")
    }
  }

  const handleToggleActive = async (reward: Reward) => {
    setRewards((prevRewards) => prevRewards.map((r) => (r.id === reward.id ? { ...r, is_active: !r.is_active } : r)))

    const response = await fetch("/api/admin/loyalty/rewards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reward,
        id: reward.id,
        is_active: !reward.is_active,
      }),
    })

    if (!response.ok) {
      setRewards((prevRewards) =>
        prevRewards.map((r) => (r.id === reward.id ? { ...r, is_active: reward.is_active } : r)),
      )
      alert("Failed to update reward status")
    }
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setFormData({ ...formData, product_id: product.id })
    setProductSearch("")
    setSearchResults([])
  }

  const handleClearProduct = () => {
    setSelectedProduct(null)
    setFormData((prev) => ({ ...prev, product_id: "" }))
    setProductSearch("")
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar userEmail={userEmail} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight mb-2">Monthly Rewards</h1>
            <p className="text-sm text-zinc-500">Manage loyalty rewards for each membership tier</p>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5 block">Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-40"
                />
              </div>

              <div>
                <Label className="text-xs text-zinc-500 mb-1.5 block">Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="bronze" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateRewards}
                disabled={isGenerating}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate Rewards"}
              </Button>
              <Button onClick={() => handleOpenModal()} className="gap-2 bg-black hover:bg-black/90">
                <Plus className="w-4 h-4" />
                Add Reward
              </Button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
                        Loading rewards...
                      </td>
                    </tr>
                  ) : rewards.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">
                        No rewards found for selected filters
                      </td>
                    </tr>
                  ) : (
                    rewards.map((reward) => (
                      <tr key={reward.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">{reward.title}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {reward.tier.charAt(0).toUpperCase() + reward.tier.slice(1)}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 capitalize">
                          {reward.reward_type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{reward.value}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {new Date(reward.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Switch checked={reward.is_active} onCheckedChange={() => handleToggleActive(reward)} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(reward)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReward(reward.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
            <DialogDescription>
              {editingReward ? "Update the reward details below" : "Create a new monthly reward for a membership tier"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 20% Off All Products"
                />
              </div>

              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the reward..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Reward Type</Label>
                <Select
                  value={formData.reward_type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, reward_type: value })
                    if (value !== "free_item") {
                      setSelectedProduct(null)
                      setFormData((prev) => ({ ...prev, product_id: "" }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.reward_type !== "free_item" ? (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g., 20% or 100"
                  />
                </div>
              ) : (
                <div className="space-y-2 col-span-2">
                  <Label>Free Product</Label>
                  {selectedProduct ? (
                    <div className="flex items-center gap-2 p-3 border border-zinc-200 rounded-lg bg-zinc-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedProduct.name}</p>
                        <p className="text-xs text-zinc-500">
                          {selectedProduct.brand} • €{selectedProduct.price}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearProduct}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search by product name or SKU..."
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleSelectProduct(product)}
                              className="w-full px-3 py-2 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0"
                            >
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-zinc-500">
                                {product.brand} • €{product.price}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Active</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveReward} className="bg-black hover:bg-black/90">
              {editingReward ? "Update Reward" : "Create Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
