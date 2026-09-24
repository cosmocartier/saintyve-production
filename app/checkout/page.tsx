"use client"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { Check, Edit2, CreditCard } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { COUNTRIES } from "@/lib/constants/countries"
import { toast } from "@/components/ui/use-toast"

type PaymentMethod = "mollie"
type CheckoutStep = 1 | 2 | 3

interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  minimum_order_value: number
  user_email: string | null
  usage_limit: number | null
  times_used: number
  valid_from: string | null
  valid_until: string | null
}

// Extend CartItem type to include optional rewardId
interface CartItem {
  id: string
  name: string
  price: string
  image?: string
  variant?: string
  variantId?: string
  quantity: number
  rewardId?: string | null // Added for tracking free item rewards
}

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart, addItem } = useCart() // Added addItem to cart hook
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const paymentMethod: PaymentMethod = "mollie"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [creditsToApply, setCreditsToApply] = useState(0)
  const [availableCredits, setAvailableCredits] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [freeItemRewards, setFreeItemRewards] = useState<any[]>([]) // Track free item rewards
  const [freeItemsAdded, setFreeItemsAdded] = useState(false) // Track if free items already added

  const subtotal = getSubtotal()
  const shipping = 0
  const tax = 0
  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0
  const creditsDiscount = creditsToApply * 0.89
  const total = Math.max(0, subtotal - discount - creditsDiscount + shipping + tax)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setFormData({
            email: profile.email || user.email || "",
            phone: profile.phone || "",
            fullName: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
            address: profile.address_street || "",
            city: profile.address_city || "",
            postalCode: profile.address_zip || "",
            country: profile.address_country || "",
          })
          setAvailableCredits(profile.credits || 0)
        }
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      setUser(authUser)

      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("credits").eq("id", authUser.id).single()

        if (profile) {
          setAvailableCredits(profile.credits || 0)
        }
      }
    }

    fetchUserAndCredits()
  }, [])

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.push("/")
    }
  }, [items, router, isSubmitting])

  useEffect(() => {
    const fetchFreeItemRewards = async () => {
      if (!user || freeItemsAdded) return

      const supabase = createBrowserClient()

      const { data: userRewards, error: rewardsError } = await supabase
        .from("loyalty_user_rewards")
        .select(`
          *,
          reward:loyalty_rewards!inner(
            id,
            reward_type,
            product_id,
            title,
            expires_at
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "claimed")
        .is("used_in_order_id", null)
        .eq("reward.reward_type", "free_item")
        .gt("reward.expires_at", new Date().toISOString())

      if (rewardsError || !userRewards || userRewards.length === 0) return

      // Fetch product details for each free item reward
      const productIds = userRewards
        .map((ur: any) => ur.reward?.product_id)
        .filter((id: string | undefined): id is string => Boolean(id))

      if (productIds.length === 0) return

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, slug, price, category, brand")
        .in("id", productIds)

      if (productsError || !products) return

      const { data: images } = await supabase
        .from("product_images")
        .select("product_id, url")
        .in("product_id", productIds)
        .order("display_order", { ascending: true })

      // Create a map of product_id to first image URL
      const imageMap = new Map<string, string>()
      images?.forEach((img) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.url)
        }
      })

      // Add free items to cart automatically
      products.forEach((product) => {
        const alreadyInCart = items.some((item) => item.id === product.id && item.price === "EUR 0.00")

        if (!alreadyInCart) {
          const matchingReward = userRewards.find((ur: any) => ur.reward?.product_id === product.id)

          addItem({
            id: product.id,
            name: `${product.name} (Free Reward)`,
            price: "EUR 0.00", // Use EUR format to match normal products
            image: imageMap.get(product.id) || "/placeholder.svg",
            variant: undefined,
            variantId: undefined,
            rewardId: matchingReward?.id, // Store reward ID for tracking
            slug: product.slug,
          })
        }
      })

      setFreeItemRewards(products)
      setFreeItemsAdded(true)

      console.log("[v0] Added free item rewards to cart:", products.length)
    }

    fetchFreeItemRewards()
  }, [user, items, addItem, freeItemsAdded])

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Please enter your email address."
    if (!privacyAccepted) newErrors.privacy = "Please accept the privacy policy."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.phone) newErrors.phone = "Please enter your phone number."
    if (!formData.fullName) newErrors.fullName = "Please enter your full name."
    if (!formData.address) newErrors.address = "Please enter your shipping address."
    if (!formData.city) newErrors.city = "Please enter your city."
    if (!formData.postalCode) newErrors.postalCode = "Please enter your postal code."
    if (!formData.country) newErrors.country = "Please select your country."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2)
      setErrors({})
    }
  }

  const handleContinueFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3)
      setErrors({})
    }
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    try {
      console.log("[v0] Starting order creation with payment method:", paymentMethod)

      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const userId = user?.id || null

      console.log("[v0] Creating order with data:", {
        userId,
        paymentMethod,
        total,
        email: formData.email,
      })

      console.log(
        "[v0] Cart items to be saved:",
        items.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
      )

      const initialStatus = "pending"
      const reservedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString()

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: initialStatus,
          payment_method: paymentMethod,
          total: total,
          subtotal_amount: subtotal,
          shipping_amount: shipping,
          tax_amount: tax,
          total_amount: total,
          discount_amount: discount + creditsDiscount,
          coupon_code: appliedCoupon?.code || null,
          credits_applied: creditsToApply,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_name: formData.fullName,
          shipping_address: formData,
          reserved_until: reservedUntil,
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Order creation error:", orderError)
        toast({
          title: "Error",
          description: "We couldn't start the payment. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Order created successfully:", order.id)

      if (items.length > 0) {
        const orderItemsToInsert = items.map((item) => {
          const priceNum = Number.parseFloat(item.price.replace(/€|EUR/g, "").replace(/,/g, "").trim())

          return {
            order_id: order.id,
            product_id: item.id,
            variant_id: item.variantId || null,
            quantity: item.quantity,
            price: priceNum,
          }
        })

        console.log("[v0] Inserting order items:", orderItemsToInsert)

        const { data: insertedItems, error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsToInsert)
          .select()

        if (itemsError) {
          console.error("[v0] CRITICAL ERROR: Failed to insert order items:", itemsError)

          await supabase.from("orders").delete().eq("id", order.id)

          toast({
            title: "Error",
            description: "We couldn't start the payment. Please try again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        console.log("[v0] Order items inserted successfully:", insertedItems?.length || 0)
      } else {
        console.error("[v0] CRITICAL ERROR: No items in cart!")

        await supabase.from("orders").delete().eq("id", order.id)

        toast({
          title: "Error",
          description: "Your cart is empty. Please add items before checkout.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (appliedCoupon) {
        console.log("[v0] Tracking coupon usage for:", appliedCoupon.code)

        const { error: couponUpdateError } = await supabase
          .from("coupons")
          .update({ times_used: appliedCoupon.times_used + 1 })
          .eq("id", appliedCoupon.id)

        if (couponUpdateError) {
          console.error("[v0] Error updating coupon usage count:", couponUpdateError)
        } else {
          console.log("[v0] Coupon usage count incremented successfully")
        }

        const { error: couponUsageError } = await supabase.from("coupon_usage").insert({
          coupon_id: appliedCoupon.id,
          user_id: userId,
          order_id: order.id,
          discount_amount: discount,
        })

        if (couponUsageError) {
          console.error("[v0] Error creating coupon usage record:", couponUsageError)
        } else {
          console.log("[v0] Coupon usage record created successfully")
        }
      }

      if (userId && creditsToApply > 0) {
        const { error: creditsError } = await supabase
          .from("profiles")
          .update({ credits: availableCredits - creditsToApply })
          .eq("id", userId)

        if (creditsError) {
          console.error("[v0] Error deducting credits:", creditsError)
        }
      }

      const rewardIdsToUpdate = items
        .filter((item) => item.rewardId) // Only items with a rewardId (free rewards)
        .map((item) => item.rewardId)
        .filter(Boolean)

      if (rewardIdsToUpdate.length > 0) {
        console.log("[v0] Marking rewards as used in order:", rewardIdsToUpdate)

        const { error: rewardUpdateError } = await supabase
          .from("loyalty_user_rewards")
          .update({ used_in_order_id: order.id })
          .in("id", rewardIdsToUpdate)

        if (rewardUpdateError) {
          console.error("[v0] Error marking rewards as used:", rewardUpdateError)
        } else {
          console.log("[v0] Successfully marked rewards as used in order")
        }
      }

      clearCart()

      console.log("[v0] Redirecting to payment page for method:", paymentMethod)
      window.location.href = `/pay/${order.id}`

      fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      }).catch((error) => {
        console.error("[v0] Error in background email sending:", error)
      })
    } catch (error) {
      console.error("[v0] Unexpected error during order creation:", error)
      toast({
        title: "Error",
        description: "We couldn't start the payment. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleEditStep = (step: CheckoutStep) => {
    setCurrentStep(step)
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code")
      return
    }

    setIsApplyingPromo(true)
    setPromoError("")

    try {
      const supabase = createBrowserClient()

      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("enabled", true)
        .single()

      if (error || !coupon) {
        setPromoError("Promo code not found or invalid")
        setIsApplyingPromo(false)
        return
      }

      const now = new Date()
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        setPromoError("This promo code is not yet valid")
        setIsApplyingPromo(false)
        return
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        setPromoError("This promo code has expired")
        setIsApplyingPromo(false)
        return
      }

      if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
        setPromoError(`Minimum order value of EUR ${coupon.minimum_order_value.toFixed(2)} required`)
        setIsApplyingPromo(false)
        return
      }

      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        setPromoError("This promo code has reached its usage limit")
        setIsApplyingPromo(false)
        return
      }

      if (coupon.user_email && coupon.user_email !== formData.email) {
        setPromoError("This promo code is not valid for your account")
        setIsApplyingPromo(false)
        return
      }

      setAppliedCoupon(coupon)
      setShowPromoInput(false)
      setPromoCode("")
      setPromoError("")
    } catch (err) {
      console.error("Error applying promo code:", err)
      setPromoError("Failed to apply promo code")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const removePromoCode = () => {
    setAppliedCoupon(null)
    setPromoCode("")
    setPromoError("")
  }

  const maxCreditsAllowed = Math.min(availableCredits, Math.floor(subtotal / 0.89))

  const handleCreditsInputChange = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    const clampedValue = Math.max(0, Math.min(numValue, maxCreditsAllowed))
    setCreditsToApply(clampedValue)
  }

  const applyMaxCredits = () => {
    setCreditsToApply(maxCreditsAllowed)
  }

  if (items.length === 0) {
    return null
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-zinc-500">Loading checkout...</p>
        </div>
      </div>
    )
  }

  const inputClass =
    "w-full h-12 px-0 border-0 border-b border-zinc-300 rounded-none text-[14px] text-black placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors bg-transparent font-sans"
  const labelClass = "block text-[11px] uppercase tracking-[0.1em] text-black mb-2"

  return (
    <div className="min-h-screen bg-white">
      <CartSidebar />
      <StaticNavigation />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 mt-20">
        <div className="lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* LEFT — CHECKOUT */}
          <div className="mb-12 lg:mb-0">
            {/* 01 CONTACT */}
            <section>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] tracking-[0.2em] ${currentStep >= 1 ? "text-black" : "text-zinc-400"}`}>
                    01
                  </span>
                  <h2
                    className={`text-[13px] uppercase tracking-[0.15em] font-medium ${
                      currentStep >= 1 ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    Contact
                  </h2>
                  {currentStep > 1 && <Check className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />}
                </div>
                {currentStep > 1 && (
                  <button
                    onClick={() => handleEditStep(1)}
                    className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-zinc-500 hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 1 ? (
                <div className="pt-6 pb-10">
                  <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 max-w-md">
                    We&apos;ll use this to send your order confirmation.
                  </p>

                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1.5">{errors.email}</p>}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-black text-black focus:ring-black border-zinc-300 rounded-none"
                      />
                      <span className="text-[13px] text-zinc-600 leading-relaxed">
                        I have read and understood the{" "}
                        <a href="/privacy" className="underline hover:no-underline text-black">
                          Privacy Policy
                        </a>
                        , and I agree to receive marketing communications via email.
                      </span>
                    </label>
                    {errors.privacy && <p className="text-red-600 text-xs">{errors.privacy}</p>}

                    <button
                      onClick={handleContinueFromStep1}
                      className="w-full bg-black text-white h-12 rounded-none text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-zinc-800 transition-colors mt-2"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : currentStep > 1 ? (
                <div className="pt-4 pb-8">
                  <p className="text-[13px] text-zinc-500">{formData.email}</p>
                </div>
              ) : (
                <div className="pb-10" />
              )}
            </section>

            {/* 02 DELIVERY */}
            <section>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] tracking-[0.2em] ${currentStep >= 2 ? "text-black" : "text-zinc-400"}`}>
                    02
                  </span>
                  <h2
                    className={`text-[13px] uppercase tracking-[0.15em] font-medium ${
                      currentStep >= 2 ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    Delivery
                  </h2>
                  {currentStep > 2 && <Check className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />}
                </div>
                {currentStep > 2 && (
                  <button
                    onClick={() => handleEditStep(2)}
                    className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-zinc-500 hover:text-black transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 2 ? (
                <div className="pt-6 pb-10">
                  <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 max-w-md">
                    Where should we deliver your order?
                  </p>

                  <div className="space-y-5 max-w-md">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.phone && <p className="text-red-600 text-xs mt-1.5">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={inputClass}
                        placeholder="Chloe Bennett"
                      />
                      {errors.fullName && <p className="text-red-600 text-xs mt-1.5">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={inputClass}
                        placeholder="5th Avenue 740"
                      />
                      {errors.address && <p className="text-red-600 text-xs mt-1.5">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={inputClass}
                          placeholder="New York"
                        />
                        {errors.city && <p className="text-red-600 text-xs mt-1.5">{errors.city}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Postal Code</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className={inputClass}
                          placeholder="10019"
                        />
                        {errors.postalCode && <p className="text-red-600 text-xs mt-1.5">{errors.postalCode}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {errors.country && <p className="text-red-600 text-xs mt-1.5">{errors.country}</p>}
                    </div>

                    <button
                      onClick={handleContinueFromStep2}
                      className="w-full bg-black text-white h-12 rounded-none text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-zinc-800 transition-colors mt-2"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : currentStep > 2 ? (
                <div className="pt-4 pb-8">
                  <p className="text-[13px] text-zinc-500">
                    {formData.address}, {formData.city}
                  </p>
                </div>
              ) : (
                <div className="pb-10" />
              )}
            </section>

            {/* 03 PAYMENT */}
            <section>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] tracking-[0.2em] ${currentStep >= 3 ? "text-black" : "text-zinc-400"}`}>
                    03
                  </span>
                  <h2
                    className={`text-[13px] uppercase tracking-[0.15em] font-medium ${
                      currentStep >= 3 ? "text-black" : "text-zinc-400"
                    }`}
                  >
                    Payment
                  </h2>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="pt-6 pb-10">
                  <p className="text-[14px] text-zinc-500 leading-relaxed mb-6 max-w-md">Pay securely by card.</p>

                  <div className="max-w-md">
                    <div className="flex items-center justify-between border border-zinc-300 p-5">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-black" strokeWidth={1.5} />
                        <div>
                          <p className="text-[14px] font-medium text-black">Credit / Debit Card</p>
                          <p className="text-[12px] text-zinc-500 mt-0.5">Secure payment via Mollie</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[12px] text-zinc-500 leading-relaxed mt-4">
                      Your payment is securely processed by Mollie.
                    </p>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full bg-black text-white h-12 rounded-none text-[12px] uppercase tracking-[0.15em] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                      {isSubmitting ? "Redirecting to payment..." : `Pay EUR ${total.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-[13px] uppercase tracking-[0.15em] font-medium text-black">
                Order Summary ({items.length})
              </h2>
              <a href="/cart" className="text-[12px] uppercase tracking-[0.1em] text-zinc-500 hover:text-black transition-colors">
                Modify
              </a>
            </div>

            <div className="space-y-5 py-6">
              {items.map((item: CartItem) => (
                <div key={`${item.id}-${item.variant || ""}`} className="flex gap-4">
                  <div className="w-20 h-20 bg-zinc-100 flex-shrink-0 overflow-hidden">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[14px] text-black leading-snug">{item.name}</h3>
                    {item.variant && <p className="text-[12px] text-zinc-500 mt-1">Size: {item.variant}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[12px] text-zinc-500">Qty {item.quantity}</p>
                      <p className="text-[14px] text-black font-medium">{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-5 pb-5">
              {!appliedCoupon && !showPromoInput && (
                <button
                  type="button"
                  onClick={() => setShowPromoInput(true)}
                  className="text-[12px] uppercase tracking-[0.1em] text-zinc-500 hover:text-black transition-colors underline"
                >
                  Have a promo code?
                </button>
              )}

              {!appliedCoupon && showPromoInput && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError("")
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-0 h-10 text-[13px] border-0 border-b border-zinc-300 rounded-none bg-transparent focus:outline-none focus:border-black"
                      disabled={isApplyingPromo}
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={isApplyingPromo}
                      className="px-5 h-10 text-[12px] uppercase tracking-[0.1em] bg-black text-white rounded-none hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="text-[12px] text-red-600">{promoError}</p>}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-black uppercase tracking-[0.05em]">Promo — {appliedCoupon.code}</span>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-[12px] uppercase tracking-[0.1em] text-zinc-500 hover:text-black transition-colors underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-5 space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-black">EUR {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-zinc-500">Discount</span>
                  <span className="text-black">– EUR {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-zinc-500">Shipping</span>
                <span className="text-black">Free</span>
              </div>
              <div className="flex justify-between text-[20px] pt-4 border-t border-zinc-200 font-medium">
                <span className="text-black">Total</span>
                <span className="text-black">EUR {total.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">VAT included</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
