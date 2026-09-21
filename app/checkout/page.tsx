"use client"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { Check, Edit2, CreditCard, Wallet, ChevronDown } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { COUNTRIES } from "@/lib/constants/countries"
import { toast } from "@/components/ui/use-toast"

type PaymentMethod = "bank_transfer" | "credit_card" | "paypal" | "mollie"
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer")
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
  const [isSecureCheckoutExpanded, setIsSecureCheckoutExpanded] = useState(false)
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
    if (!formData.email) newErrors.email = "Email is required"
    if (!privacyAccepted) newErrors.privacy = "Please accept the privacy policy"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (!formData.address) newErrors.address = "Street address is required"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.postalCode) newErrors.postalCode = "ZIP code is required"
    if (!formData.country) newErrors.country = "Country is required"

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
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Order created successfully:", order.id)

      if (items.length > 0) {
        const orderItemsToInsert = items.map((item) => {
          const priceNum = Number.parseFloat(item.price.replace(/€|EUR/g, "").trim())

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
            description: "Failed to save order items. Please try again.",
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
        description: "An unexpected error occurred. Please try again.",
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
          <p className="mt-4 text-sm text-[#777]">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <CartSidebar />
      <StaticNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 mt-20">
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-12">
          <div className="space-y-5 mb-8 lg:mb-0">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
                <div
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    currentStep === 1
                      ? "bg-black border-[1.5px] border-black"
                      : currentStep > 1
                        ? "bg-[#4CAF50] border-[1.5px] border-[#4CAF50]"
                        : "bg-transparent border-[1.5px] border-[#C7C7C7]"
                  }`}
                >
                  {currentStep > 1 ? (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : (
                    <span className={`text-[12px] font-medium ${currentStep === 1 ? "text-white" : "text-[#C7C7C7]"}`}>
                      1
                    </span>
                  )}
                </div>
                <h2 className={`text-[20px] font-medium ${currentStep >= 1 ? "text-black" : "text-[#C7C7C7]"}`}>
                  Identification
                </h2>
              </div>

              {currentStep === 1 ? (
                <div className="bg-[#FAFAFA] rounded-[10px] p-6 mt-2">
                  <p className="text-[15px] text-[#555] leading-relaxed mb-6 max-w-lg">
                    In order to better assist you, please enter your email address before continuing your purchase.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                        Email <span className="text-[#999690]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-black focus:ring-black border-[#D5D5D5] rounded"
                      />
                      <span className="text-[14px] text-[#444] leading-relaxed">
                        I have read and understood the{" "}
                        <a href="/privacy" className="underline hover:no-underline">
                          Privacy Policy
                        </a>
                        , and I agree to receive marketing communications via email.
                      </span>
                    </label>
                    {errors.privacy && <p className="text-red-500 text-xs">{errors.privacy}</p>}

                    <button
                      onClick={handleContinueFromStep1}
                      className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors mt-4"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : currentStep > 1 ? (
                <div className="bg-[#FAFAFA] rounded-[10px] p-5 mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-black">Identification</p>
                    <p className="text-[13px] text-[#777] mt-0.5">Your email: {formData.email}</p>
                  </div>
                  <button
                    onClick={() => handleEditStep(1)}
                    className="flex items-center gap-1.5 text-[13px] text-black hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
                <div
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    currentStep === 2
                      ? "bg-black border-[1.5px] border-black"
                      : currentStep > 2
                        ? "bg-[#4CAF50] border-[1.5px] border-[#4CAF50]"
                        : "bg-transparent border-[1.5px] border-[#C7C7C7]"
                  }`}
                >
                  {currentStep > 2 ? (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : (
                    <span className={`text-[12px] font-medium ${currentStep === 2 ? "text-white" : "text-[#C7C7C7]"}`}>
                      2
                    </span>
                  )}
                </div>
                <h2 className={`text-[20px] font-medium ${currentStep >= 2 ? "text-black" : "text-[#C7C7C7]"}`}>
                  Delivery Options
                </h2>
              </div>

              {currentStep === 2 ? (
                <div className="bg-[#FAFAFA] rounded-[10px] p-6 mt-2">
                  <p className="text-[15px] text-[#555] leading-relaxed mb-6 max-w-lg">
                    Please provide your shipping address to ensure timely delivery.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                        Phone Number <span className="text-[#999690]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                        Full Name <span className="text-[#999690]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                        placeholder="John Doe"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                        Street Address <span className="text-[#999690]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                        placeholder="123 Main Street"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                          City <span className="text-[#999690]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                          placeholder="New York"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                          ZIP Code <span className="text-[#999690]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] placeholder:text-[#BCBAB5] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                          placeholder="10001"
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1.5">{errors.postalCode}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal mb-2">
                        Country <span className="text-[#999690]">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full h-11 px-4 border border-[#D5D3CE] rounded-none text-[14px] text-[#111111] focus:border-[#111111] focus:outline-none transition-colors bg-white font-sans"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {errors.country && <p className="text-red-500 text-xs mt-1.5">{errors.country}</p>}
                    </div>

                    <button
                      onClick={handleContinueFromStep2}
                      className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors mt-4"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : currentStep > 2 ? (
                <div className="bg-[#FAFAFA] rounded-[10px] p-5 mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-black">Delivery Options</p>
                    <p className="text-[13px] text-[#777] mt-0.5">
                      {formData.address}, {formData.city}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(2)}
                    className="flex items-center gap-1.5 text-[13px] text-black hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
                <div
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    currentStep === 3
                      ? "bg-black border-[1.5px] border-black"
                      : "bg-transparent border-[1.5px] border-[#C7C7C7]"
                  }`}
                >
                  <span className={`text-[12px] font-medium ${currentStep === 3 ? "text-white" : "text-[#C7C7C7]"}`}>
                    3
                  </span>
                </div>
                <h2 className={`text-[20px] font-medium ${currentStep >= 3 ? "text-black" : "text-[#C7C7C7]"}`}>
                  Payment
                </h2>
              </div>

              {currentStep === 3 && (
                <div className="bg-[#FAFAFA] rounded-[10px] p-6 mt-2">
                  <p className="text-[15px] text-[#555] leading-relaxed mb-6 max-w-lg">
                    Select your preferred payment method to complete your order.
                  </p>

                  <div className="space-y-4 mb-6">
                    <label
                      className={`flex items-center justify-between cursor-pointer p-[18px] border transition-all bg-white ${
                        paymentMethod === "mollie" ? "border-[#111111]" : "border-[#E5E5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="mollie"
                          checked={paymentMethod === "mollie"}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="text-black focus:ring-black h-4 w-4"
                        />
                        <span className="text-[15px] font-medium text-[#111111] font-sans">
                          Card / iDEAL / Bancontact
                        </span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#111111]" />
                    </label>

                    <label
                      className={`flex items-center justify-between cursor-pointer p-[18px] border transition-all bg-white ${
                        paymentMethod === "bank_transfer" ? "border-[#111111]" : "border-[#E5E5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="text-black focus:ring-black h-4 w-4"
                        />
                        <span className="text-[15px] font-medium text-[#111111] font-sans">
                          Bank Transfer
                        </span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#111111]" />
                    </label>
                  </div>

                  <div className="mb-6 max-w-lg">
                    <button
                      onClick={() => setIsSecureCheckoutExpanded(!isSecureCheckoutExpanded)}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
                    >
                      <span className="text-[14px] font-medium text-black">Secure manual checkout</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#666] transition-transform ${
                          isSecureCheckoutExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isSecureCheckoutExpanded ? "max-h-40 mt-3" : "max-h-0"
                      }`}
                    >
                      <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                        <p className="text-[13px] text-[#666] leading-relaxed">
                          Payments are currently verified manually to ensure quality checks and fraud prevention.
                          You&apos;ll receive confirmation and next steps right after checkout.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-black text-white h-12 rounded-[26px] text-[15px] font-medium hover:bg-[#222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "PROCESSING..." : "Complete Order"}
                  </button>

                  <p className="text-[12px] text-[#888] text-center mt-3">
                    You&apos;ll receive next steps immediately after checkout.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-[#FAFAFA] rounded-[10px] p-6 border border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-[22px] text-black font-medium">My Shopping Bag ({items.length})</h2>
                <a href="/cart" className="text-[13px] text-black underline hover:no-underline">
                  Modify cart
                </a>
              </div>

              <div className="space-y-5 mb-8">
                {items.map(
                  (
                    item: CartItem, // Explicitly type item as CartItem
                  ) => (
                    <div key={`${item.id}-${item.variant || ""}`} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[15px] text-black font-medium leading-snug">{item.name}</h3>
                        {item.variant && <p className="text-[13px] text-[#777] mt-1">Size: {item.variant}</p>}
                        <p className="text-[15px] text-black font-medium mt-2">{item.price}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-5 mb-5">
                {!appliedCoupon && !showPromoInput && (
                  <button
                    type="button"
                    onClick={() => setShowPromoInput(true)}
                    className="text-[14px] text-black underline hover:no-underline"
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
                        className="flex-1 px-3 py-2 text-[14px] border border-[#E5E5E5] rounded focus:outline-none focus:border-black"
                        disabled={isApplyingPromo}
                      />
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo}
                        className="px-5 py-2 text-[14px] bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplyingPromo ? "..." : "Apply"}
                      </button>
                    </div>
                    {promoError && <p className="text-[12px] text-red-600">{promoError}</p>}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#555]">Promo code:</span>
                      <span className="text-[14px] text-black font-medium">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-[13px] text-black underline hover:no-underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Credits section — temporarily hidden
              <div className="border-t border-[#E5E5E5] pt-5 mb-5">
                {!user ? (
                  <div>
                    <h3 className="text-[14px] text-black font-medium mb-2">Use Credits</h3>
                    <p className="text-[13px] text-[#555] mb-1">You need an account to earn and use credits.</p>
                    <a href="/auth/login" className="text-[13px] text-black underline hover:no-underline">
                      Sign in or create an account
                    </a>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-[14px] text-black font-medium mb-2">Use Credits</h3>
                    <p className="text-[13px] text-[#555] mb-3">
                      Available: <span className="font-semibold text-black">{availableCredits}</span> credits ·{" "}
                      <span className="text-[#6B6B6B]">EUR {(availableCredits * 0.89).toFixed(2)}</span>
                    </p>

                    {availableCredits > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] text-[#777] uppercase tracking-wide">Apply Credits</span>
                          <input
                            type="number"
                            min="0"
                            max={maxCreditsAllowed}
                            value={creditsToApply || ""}
                            onChange={(e) => handleCreditsInputChange(e.target.value)}
                            placeholder="0"
                            className="flex-1 px-3 py-2 text-[14px] text-right border border-[#E5E5E5] rounded focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            onClick={applyMaxCredits}
                            className="text-[13px] text-black underline hover:no-underline"
                          >
                            MAX
                          </button>
                        </div>

                        {creditsToApply > 0 && (
                          <p className="text-[12px] text-[#555]">
                            Worth: EUR {creditsDiscount.toFixed(2)} will be deducted from this order.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              */}

              <div className="border-t border-[#E5E5E5] pt-6 space-y-3">
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#555]">Subtotal</span>
                  <span className="text-black font-medium">EUR {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#555]">Discount</span>
                    <span className="text-[#2AA65A] font-medium">– EUR {discount.toFixed(2)}</span>
                  </div>
                )}
                {/* Credits summary line — temporarily hidden
                {creditsDiscount > 0 && (
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#555]">Credits</span>
                    <span className="text-[#2AA65A] font-medium">– EUR {creditsDiscount.toFixed(2)}</span>
                  </div>
                )}
                */}
                <div className="flex justify-between text-[15px]">
                  <span className="text-[#555]">Shipping</span>
                  <span className="text-[#2AA65A] font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-[20px] pt-3 border-t border-[#E5E5E5] font-medium">
                  <span className="text-black">Total</span>
                  <span className="text-black">EUR {total.toFixed(2)}</span>
                </div>
                <p className="text-[12px] text-[#999] font-light pt-1">(VAT included)</p>
              </div>
            </div>

            {/* Removed Trustpilot link component */}
          </div>
        </div>
      </div>
    </div>
  )
}
