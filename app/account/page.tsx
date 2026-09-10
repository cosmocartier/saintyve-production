"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { StaticNavigation } from "@/components/static-navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { UserOrderDetailsSidebar } from "@/components/user/user-order-details-sidebar"
import { X, Check } from "lucide-react"
import { getTrackingUrl } from "@/lib/utils/tracking"
import { COUNTRIES } from "@/lib/constants/countries"
import { CreditsSection } from "@/components/account/CreditsSection"
import AccountDetails from "@/components/account/AccountDetails"
import LoyaltySection from "@/components/account/LoyaltySection"
import OrdersSection from "@/components/account/OrdersSection"
import AiTryOnSection from "@/components/account/AiTryOnSection"
import SettingsSection from "@/components/account/SettingsSection"

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_country: string | null
  credits?: number
  welcome_credits_claimed?: boolean
  trustpilot_review_submitted?: boolean
  email_notifications?: boolean
  marketing_emails?: boolean
  role?: string
  created_at?: string
  status?: string
}

type Order = {
  id: string
  created_at: string
  status: string
  total_amount: number
  tracking_number: string | null
  courier: string | null
  pending_credits: boolean | null
  credits_to_award?: number
  shipping_address: any
  order_items: Array<{
    id: string
    quantity: number
    price: number
    tracking_number: string | null
    courier: string | null
    products: {
      name: string
      image: string
      id: string
    } | null
    product_variants: {
      size: string
    } | null
  }>
}

type OrderItem = {
  id: string
  quantity: number
  price: number
  products: {
    name: string
    image: string
    id: string
  } | null
  product_variants: {
    size: string
  } | null
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([])
  const [selectedOrderTotal, setSelectedOrderTotal] = useState(0)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(null)
  const [selectedOrderPendingCredits, setSelectedOrderPendingCredits] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedOrderShippingAddress, setSelectedOrderShippingAddress] = useState<{
    firstName?: string
    lastName?: string
    address?: string
    apartment?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    phone?: string
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_country: "United States",
  })
  const [tryonImages, setTryonImages] = useState<Array<{ id: string; image_url: string }>>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)

  const [credits, setCredits] = useState(0)
  const [referralEmail, setReferralEmail] = useState("")
  const [referrals, setReferrals] = useState<
    Array<{
      id: string
      referred_email: string
      status: string
      credits_awarded: number
      created_at: string
      has_purchased?: boolean
    }>
  >([])
  const [isSendingReferral, setIsSendingReferral] = useState(false)
  const [referralMessage, setReferralMessage] = useState<string | null>(null)

  const [pendingOrderCredits, setPendingOrderCredits] = useState<Order[]>([])
  const [welcomeCreditsAvailable, setWelcomeCreditsAvailable] = useState(false)
  const [trustpilotReviewSubmitted, setTrustpilotReviewSubmitted] = useState(false)
  const [tiktokSubmissions, setTiktokSubmissions] = useState<
    Array<{
      id: string
      video_url: string
      status: string
      credits_awarded: number
      created_at: string
      credits_collected?: boolean
    }>
  >([])
  const [trustpilotSubmissions, setTrustpilotSubmissions] = useState<
    Array<{
      id: string
      email: string
      status: string
      credits_amount: number
      created_at: string
      review_url: string
      credits_collected?: boolean
    }>
  >([])
  const [isClaimingWelcomeCredits, setIsClaimingWelcomeCredits] = useState(false)
  const [tiktokVideoUrl, setTiktokVideoUrl] = useState("")
  const [isSubmittingTiktok, setIsSubmittingTiktok] = useState(false)
  const [isSubmittingTrustpilot, setIsSubmittingTrustpilot] = useState(false)
  const [trustpilotEmail, setTrustpilotEmail] = useState("")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [isCollectingCredits, setIsCollectingCredits] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "account-details", label: "Account Details" },
    { id: "orders", label: "Orders" },
    { id: "credits", label: "Credits" },
    { id: "loyalty", label: "Loyalty" },
    { id: "ai-tryon", label: "AI Try-On" },
    { id: "settings", label: "Settings" },
  ]

  const [showCreditsToast, setShowCreditsToast] = useState(false)
  const [creditsEarned, setCreditsEarned] = useState(0)

  const activeOrders = orders.filter((o) => o.status === "processing" || o.status === "shipped").length

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently"

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

      setProfile(profileData)

      setEmailNotifications(profileData?.email_notifications ?? true)
      setMarketingEmails(profileData?.marketing_emails ?? false)

      setCredits(profileData?.credits || 0)
      setWelcomeCreditsAvailable(!(profileData?.welcome_credits_claimed || false))
      setTrustpilotReviewSubmitted(profileData?.trustpilot_review_submitted || false)

      if (profileData) {
        setFormData({
          first_name: profileData.first_name || profileData.full_name?.split(" ")[0] || "",
          last_name: profileData.last_name || profileData.full_name?.split(" ").slice(1).join(" ") || "",
          phone: profileData.phone || "",
          address_street: profileData.address_street || "",
          address_city: profileData.address_city || "",
          address_state: profileData.address_state || "",
          address_zip: profileData.address_zip || "",
          address_country: profileData.address_country || "United States",
        })
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              name,
              id
            ),
            product_variants (
              size
            )
          )
        `,
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (ordersData) {
        for (const order of ordersData) {
          for (const item of order.order_items) {
            if (item.products) {
              const { data: imageData } = await supabase
                .from("product_images")
                .select("url")
                .eq("product_id", item.products.id)
                .order("display_order", { ascending: true })
                .limit(1)
                .single()

              if (imageData) {
                item.products.image = imageData.url
              }
            }
          }
        }
      }

      setOrders(ordersData || [])

      const { data: pendingCreditsOrders } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          status,
          total_amount,
          pending_credits,
          credits_to_award,
          order_items (
            *,
            products (
              name,
              id
            ),
            product_variants (
              size
            )
          )
        `,
        )
        .eq("user_id", currentUser.id)
        .eq("pending_credits", true)
        .is("credits_collected", false)
        .order("created_at", { ascending: false })

      if (pendingCreditsOrders) {
        for (const order of pendingCreditsOrders) {
          for (const item of order.order_items) {
            if (item.products) {
              const { data: imageData } = await supabase
                .from("product_images")
                .select("url")
                .eq("product_id", item.products.id)
                .order("display_order", { ascending: true })
                .limit(1)
                .single()

              if (imageData) {
                item.products.image = imageData.url
              }
            }
          }
        }
      }

      setPendingOrderCredits(pendingCreditsOrders || [])

      const { data: tryonData } = await supabase
        .from("tryon_images")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      setTryonImages(tryonData || [])

      const { data: referralsData } = await supabase
        .from("referrals")
        .select("*, credits_awarded")
        .eq("referrer_id", currentUser.id)
        .eq("credits_collected", false)
        .order("created_at", { ascending: false })

      setReferrals(referralsData || [])

      const { data: tiktokData } = await supabase
        .from("tiktok_submissions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("credits_collected", false)
        .order("created_at", { ascending: false })

      setTiktokSubmissions(tiktokData || [])

      const { data: trustpilotData } = await supabase
        .from("trustpilot_submissions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("credits_collected", false)
        .order("created_at", { ascending: false })

      setTrustpilotSubmissions(trustpilotData || [])
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleOrderClick = async (order: Order) => {
    const supabase = createClient()

    const { data: orderItemsData } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products (
          name,
          id
        ),
        product_variants (
          size
        )
      `,
      )
      .eq("order_id", order.id)

    if (orderItemsData) {
      for (const item of orderItemsData) {
        if (item.products) {
          const { data: imageData } = await supabase
            .from("product_images")
            .select("url")
            .eq("product_id", item.products.id)
            .order("display_order", { ascending: true })
            .limit(1)
            .single()

          if (imageData) {
            item.products.image = imageData.url
          }
        }
      }
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select("shipping_address, status, pending_credits")
      .eq("id", order.id)
      .single()

    setSelectedOrderId(order.id)
    setSelectedOrderItems(orderItemsData || [])
    setSelectedOrderTotal(order.total_amount)
    setSelectedOrderStatus(orderData?.status || order.status)
    setSelectedOrderPendingCredits(orderData?.pending_credits || false)
    setSelectedOrderShippingAddress(orderData?.shipping_address || null)
    setIsSidebarOpen(true)
  }

  const handleSaveProfile = async () => {
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update(formData).eq("id", user.id)

    if (!error) {
      setProfile({ ...profile, ...formData } as Profile)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || profile.full_name?.split(" ")[0] || "",
        last_name: profile.last_name || profile.full_name?.split(" ").slice(1).join(" ") || "",
        phone: (profile as any).phone || "",
        address_street: (profile as any).address_street || "",
        address_city: (profile as any).address_city || "",
        address_state: (profile as any).address_state || "",
        address_zip: (profile as any).address_zip || "",
        address_country: (profile as any).address_country || "United States",
      })
    }
    setIsEditing(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)

    try {
      const supabase = createClient()

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("tryon-images")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("tryon-images").getPublicUrl(fileName)

      const { data: imageData, error: dbError } = await supabase
        .from("tryon_images")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError

      setTryonImages([imageData, ...tryonImages])
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      const supabase = createClient()

      await supabase.from("tryon_images").delete().eq("id", imageId)

      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("tryon-images").remove([`${user.id}/${fileName}`])
      }

      setTryonImages(tryonImages.filter((img) => img.id !== imageId))
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResendingVerification(true)
    setVerificationMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/account`,
        },
      })

      if (error) throw error

      setVerificationMessage("Verification email sent! Please check your inbox.")
    } catch (error) {
      console.error("Error resending verification:", error)
      setVerificationMessage("Failed to send verification email. Please try again.")
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!referralEmail.trim()) {
      setReferralMessage("Please enter an email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(referralEmail)) {
      setReferralMessage("Please enter a valid email address")
      return
    }

    setIsSendingReferral(true)
    setReferralMessage(null)

    try {
      const supabase = createClient()

      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", user.id)
        .eq("referred_email", referralEmail.toLowerCase())
        .single()

      if (existing) {
        setReferralMessage("You've already referred this email address")
        setIsSendingReferral(false)
        return
      }

      const { data: referral, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referred_email: referralEmail.toLowerCase(),
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      setReferrals([referral, ...referrals])
      setReferralEmail("")
      setReferralMessage("Referral invitation sent successfully!")

      setTimeout(() => setReferralMessage(null), 3000)
    } catch (error) {
      console.error("Error sending referral:", error)
      setReferralMessage("Failed to send referral. Please try again.")
    } finally {
      setIsSendingReferral(false)
    }
  }

  const handleClaimWelcomeCredits = async () => {
    setIsClaimingWelcomeCredits(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          welcome_credits_claimed: true,
          credits: (profile?.credits || 0) + 15,
        })
        .eq("id", user.id)

      if (error) throw error

      setCreditsEarned(15)
      setShowCreditsToast(true)

      setCredits((profile?.credits || 0) + 15)
      setWelcomeCreditsAvailable(false)
      setProfile({ ...profile, credits: (profile?.credits || 0) + 15 } as Profile)
    } catch (error) {
      console.error("Error claiming welcome credits:", error)
    } finally {
      setIsClaimingWelcomeCredits(false)
    }
  }

  const handleSubmitTiktok = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tiktokVideoUrl.trim()) {
      return
    }

    setIsSubmittingTiktok(true)

    try {
      const supabase = createClient()

      const { data: submission, error } = await supabase
        .from("tiktok_submissions")
        .insert({
          user_id: user.id,
          video_url: tiktokVideoUrl,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      setTiktokSubmissions([submission, ...tiktokSubmissions])
      setTiktokVideoUrl("")
    } catch (error) {
      console.error("Error submitting TikTok video:", error)
    } finally {
      setIsSubmittingTiktok(false)
    }
  }

  const handleSubmitTrustpilot = async () => {
    if (!trustpilotEmail.trim()) {
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trustpilotEmail)) {
      return
    }

    setIsSubmittingTrustpilot(true)

    try {
      const supabase = createClient()

      const { data: submission, error } = await supabase
        .from("trustpilot_submissions")
        .insert({
          user_id: user.id,
          email: trustpilotEmail,
          review_url: "https://www.trustpilot.com/review/designerdrip.store",
          credits_amount: 25,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      setTrustpilotSubmissions([submission, ...trustpilotSubmissions])
      setTrustpilotEmail("")
      setTrustpilotReviewSubmitted(true)
    } catch (error) {
      console.error("Error submitting Trustpilot review:", error)
    } finally {
      setIsSubmittingTrustpilot(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string, source: "tiktok" | "trustpilot") => {
    try {
      const supabase = createClient()

      if (source === "tiktok") {
        await supabase.from("tiktok_submissions").delete().eq("id", submissionId)
        setTiktokSubmissions(tiktokSubmissions.filter((sub) => sub.id !== submissionId))
      } else if (source === "trustpilot") {
        await supabase.from("trustpilot_submissions").delete().eq("id", submissionId)
        setTrustpilotSubmissions(trustpilotSubmissions.filter((sub) => sub.id !== submissionId))
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
    }
  }

  const handleEmailNotificationsToggle = async (checked: boolean) => {
    setEmailNotifications(checked)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ email_notifications: checked }).eq("id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating email notifications:", error)
      setEmailNotifications(!checked)
    }
  }

  const handleMarketingEmailsToggle = async (checked: boolean) => {
    setMarketingEmails(checked)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ marketing_emails: checked }).eq("id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating marketing emails:", error)
      setMarketingEmails(!checked)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      setPasswordSuccess("Password changed successfully!")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordSuccess(null)
      }, 2000)
    } catch (error: any) {
      console.error("Error changing password:", error)
      setPasswordError(error.message || "Failed to change password. Please try again.")
    }
  }

  const handleCollectOrderCredits = async (orderId: string) => {
    setIsCollectingCredits(orderId)

    try {
      const supabase = createClient()

      const { error: orderError } = await supabase.from("orders").update({ credits_collected: true }).eq("id", orderId)

      if (orderError) throw orderError

      const newCredits = credits + 15
      const { error: profileError } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (profileError) throw profileError

      setCredits(newCredits)
      const orderToUpdate = pendingOrderCredits.find((o) => o.id === orderId)
      setCreditsEarned(orderToUpdate?.credits_to_award || 15)
      setShowCreditsToast(true)

      setPendingOrderCredits(pendingOrderCredits.filter((order) => order.id !== orderId))
      setProfile({ ...profile, credits: newCredits } as Profile)
    } catch (error) {
      console.error("Error collecting order credits:", error)
    } finally {
      setIsCollectingCredits(null)
    }
  }

  const handleCollectReferralCredits = async (referralId: string) => {
    setIsCollectingCredits(referralId)

    try {
      const supabase = createClient()

      const { error: referralError } = await supabase
        .from("referrals")
        .update({ credits_collected: true })
        .eq("id", referralId)

      if (referralError) throw referralError

      const referralToUpdate = referrals.find((r) => r.id === referralId)
      const creditsAmount = referralToUpdate?.credits_awarded || 50
      const newCredits = credits + creditsAmount

      const { error: profileError } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (profileError) throw profileError

      setCredits(newCredits)
      setReferrals(referrals.filter((ref) => ref.id !== referralId))
      setProfile({ ...profile, credits: newCredits } as Profile)
    } catch (error) {
      console.error("Error collecting referral credits:", error)
    } finally {
      setIsCollectingCredits(null)
    }
  }

  const handleCollectTiktokCredits = async (submissionId: string, creditsAmount: number) => {
    setIsCollectingCredits(submissionId)

    try {
      const supabase = createClient()

      const { error: tiktokError } = await supabase
        .from("tiktok_submissions")
        .update({ credits_collected: true })
        .eq("id", submissionId)

      if (tiktokError) throw tiktokError

      const newCredits = credits + creditsAmount
      const { error: profileError } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (profileError) throw profileError

      setCredits(newCredits)
      setCreditsEarned(creditsAmount)
      setShowCreditsToast(true)

      setTiktokSubmissions(tiktokSubmissions.filter((sub) => sub.id !== submissionId))
      setProfile({ ...profile, credits: newCredits } as Profile)
    } catch (error) {
      console.error("Error collecting TikTok credits:", error)
    } finally {
      setIsCollectingCredits(null)
    }
  }

  const handleCollectTrustpilotCredits = async (submissionId: string, creditsAmount: number) => {
    setIsCollectingCredits(submissionId)

    try {
      const supabase = createClient()

      const { error: trustpilotError } = await supabase
        .from("trustpilot_submissions")
        .update({ credits_collected: true })
        .eq("id", submissionId)

      if (trustpilotError) throw trustpilotError

      const newCredits = credits + creditsAmount
      const { error: profileError } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (profileError) throw profileError

      setCredits(newCredits)
      setCreditsEarned(creditsAmount)
      setShowCreditsToast(true)

      setTrustpilotSubmissions(trustpilotSubmissions.filter((sub) => sub.id !== submissionId))
      setProfile({ ...profile, credits: newCredits } as Profile)
    } catch (error) {
      console.error("Error collecting Trustpilot credits:", error)
    } finally {
      setIsCollectingCredits(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <StaticNavigation />
        <CartSidebar />
        <div className="flex items-center justify-center pt-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <>
      <StaticNavigation />
      <CartSidebar />
      <UserOrderDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        orderItems={selectedOrderItems}
        orderId={selectedOrderId || ""}
        orderTotal={selectedOrderTotal}
        orderStatus={selectedOrderStatus}
        pendingCredits={selectedOrderPendingCredits}
        shippingAddress={selectedOrderShippingAddress}
      />
      <div className="min-h-screen bg-[#F7F7F7]">
        <div className="bg-white pt-20">
          <div className="border-b border-[#ECECEC]">
            <div className="relative mx-auto max-w-7xl">
              {/* Mobile: Scrollable tabs with fade indicators */}
              <div className="lg:hidden">
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />

                  <div className="hide-scrollbar overflow-x-auto">
                    <div className="flex gap-6 px-4">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                          className={`relative shrink-0 whitespace-nowrap pb-4 pt-6 text-sm transition-colors ${
                            activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab.label}
                          {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
                </div>
              </div>

              {/* Desktop: Original centered layout */}
              <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-12 lg:px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className={`relative pb-4 pt-6 text-base transition-colors ${
                      activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
              {/* My Account Card */}
              <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-normal lg:text-2xl">My Account</h2>
                <p className="mb-8 text-sm text-gray-600">Email: {user?.email || "No email"}</p>
                <button
                  onClick={() => setActiveTab("account-details")}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14"
                >
                  Edit my profile
                </button>
              </div>

              {/* My Orders Card */}
              <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-normal lg:text-2xl">My Orders</h2>
                <p className="mb-8 text-sm text-gray-600">
                  {activeOrders > 0
                    ? `You have ${activeOrders} active order${activeOrders > 1 ? "s" : ""}`
                    : "No active orders"}
                </p>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14"
                >
                  View orders
                </button>
              </div>

              {/* Credits Card */}
              <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-normal lg:text-2xl">Credits</h2>
                <p className="mb-2 text-sm text-gray-600">You currently have {profile?.credits || 0} credits</p>
                <p className="mb-8 text-xs text-gray-400">Use credits to reduce your order total.</p>
                <button
                  onClick={() => setActiveTab("credits")}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14"
                >
                  Manage credits
                </button>
              </div>

              {/* AI Try-On Card */}
              <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-normal lg:text-2xl">AI Try-On</h2>
                <p className="mb-8 text-sm text-gray-600">Upload your photo to preview products on you.</p>
                <button
                  onClick={() => setActiveTab("ai-tryon")}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14"
                >
                  Start AI Try-On
                </button>
              </div>

              {/* Settings Card */}
              <div className="rounded-lg border border-[#ECECEC] bg-white p-8 lg:p-10">
                <h2 className="mb-4 text-xl font-normal lg:text-2xl">Settings</h2>
                <p className="mb-8 text-sm text-gray-600">Manage notifications, password & privacy.</p>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm uppercase tracking-wider text-white transition-opacity hover:opacity-90 lg:h-14"
                >
                  Open settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account-details" && (
          <AccountDetails
            user={user}
            profile={profile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={formData}
            setFormData={setFormData}
            handleSaveProfile={handleSaveProfile}
            handleCancelEdit={handleCancelEdit}
            verificationMessage={verificationMessage}
            isResendingVerification={isResendingVerification}
            handleResendVerification={handleResendVerification}
            memberSince={memberSince}
            COUNTRIES={COUNTRIES}
          />
        )}

        {activeTab === "orders" && (
          <OrdersSection orders={orders} handleOrderClick={handleOrderClick} getTrackingUrl={getTrackingUrl} />
        )}

        {activeTab === "credits" && (
          <CreditsSection
            credits={credits}
            welcomeCreditsAvailable={welcomeCreditsAvailable}
            isClaimingWelcomeCredits={isClaimingWelcomeCredits}
            handleClaimWelcomeCredits={handleClaimWelcomeCredits}
            trustpilotEmail={trustpilotEmail}
            setTrustpilotEmail={setTrustpilotEmail}
            isSubmittingTrustpilot={isSubmittingTrustpilot}
            handleSubmitTrustpilot={handleSubmitTrustpilot}
            referralEmail={referralEmail}
            setReferralEmail={setReferralEmail}
            referralMessage={referralMessage}
            setReferralMessage={setReferralMessage}
            isSendingReferral={isSendingReferral}
            handleSendReferral={handleSendReferral}
            tiktokVideoUrl={tiktokVideoUrl}
            setTiktokVideoUrl={setTiktokVideoUrl}
            isSubmittingTiktok={isSubmittingTiktok}
            handleSubmitTiktok={handleSubmitTiktok}
            pendingOrderCredits={pendingOrderCredits}
            isCollectingCredits={isCollectingCredits}
            handleCollectOrderCredits={handleCollectOrderCredits}
            tiktokSubmissions={tiktokSubmissions}
            handleCollectTiktokCredits={handleCollectTiktokCredits}
            handleDeleteSubmission={handleDeleteSubmission}
            trustpilotSubmissions={trustpilotSubmissions}
            handleCollectTrustpilotCredits={handleCollectTrustpilotCredits}
            referrals={referrals}
            handleCollectReferralCredits={handleCollectReferralCredits}
          />
        )}

        {activeTab === "loyalty" && <LoyaltySection profile={profile} />}

        {activeTab === "ai-tryon" && (
          <AiTryOnSection
            tryonImages={tryonImages}
            isUploadingImage={isUploadingImage}
            handleImageUpload={handleImageUpload}
            handleDeleteImage={handleDeleteImage}
          />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            emailNotifications={emailNotifications}
            handleEmailNotificationsToggle={handleEmailNotificationsToggle}
            marketingEmails={marketingEmails}
            handleMarketingEmailsToggle={handleMarketingEmailsToggle}
            isChangingPassword={isChangingPassword}
            setIsChangingPassword={setIsChangingPassword}
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            passwordError={passwordError}
            passwordSuccess={passwordSuccess}
            setPasswordError={setPasswordError}
            setPasswordSuccess={setPasswordSuccess}
            handleChangePassword={handleChangePassword}
          />
        )}
      </div>

      {showCreditsToast && (
        <>
          <div className="fixed inset-0 bg-black pointer-events-none z-[100] transition-opacity duration-[180ms] ease-out opacity-[0.38]" />

          <div
            className="fixed left-1/2 -translate-x-1/2 z-[101] w-[calc(100%-32px)] max-w-[720px] transition-all duration-[250ms] ease-out"
            style={{ top: "80px" }}
          >
            <div className="bg-white rounded-[14px] shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex items-center gap-4 p-4 pr-3">
              <div className="w-16 h-16 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-black leading-snug font-medium">Credits collected successfully!</p>
                <p className="text-[15px] text-black leading-snug mt-1">
                  +{creditsEarned} credits added to your account
                </p>
              </div>

              <button
                onClick={() => setShowCreditsToast(false)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close notification"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
