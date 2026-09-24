"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { WishlistToast } from "@/components/wishlist-toast"

interface WishlistItem {
  id: string
  name: string
  price: string
  image: string
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  isOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  toggleLike: (product: WishlistItem) => Promise<void>
  isLiked: (productId: string) => boolean
  getItemCount: () => number
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    productName: string
    productImage: string
  }>({
    isVisible: false,
    productName: "",
    productImage: "",
  })
  const supabase = createClient()

  useEffect(() => {
    loadWishlist()
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
      loadWishlist()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserId(user?.id || null)
  }

  const loadWishlist = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from("user_likes")
          .select(
            `
            product_id,
            products (
              id,
              name,
              price,
              slug,
              product_images (
                url,
                display_order
              )
            )
          `,
          )
          .eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error loading wishlist from database:", error)
          loadFromLocalStorage()
        } else if (data) {
          const wishlistItems = data
            .map((item: any) => {
              if (!item.products || !item.products.id || !item.products.name) {
                return null
              }

              const frontImage = item.products.product_images?.find((img: any) => img.display_order === 0)
              const imageUrl = frontImage?.url || item.products.product_images?.[0]?.url || "/placeholder.svg"

              let formattedPrice = "EUR 0.00"
              if (item.products.price !== null && item.products.price !== undefined) {
                const priceValue =
                  typeof item.products.price === "string"
                    ? Number.parseFloat(item.products.price.replace(/[€$EUR,]/g, ""))
                    : item.products.price
                formattedPrice = `EUR ${priceValue.toFixed(2)}`
              }

              return {
                id: item.products.id,
                name: item.products.name,
                price: formattedPrice,
                image: imageUrl,
                slug: item.products.slug || "",
              }
            })
            .filter(Boolean) as WishlistItem[]
          setItems(wishlistItems)
        }
      } else {
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error("[v0] Error loading wishlist:", error)
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("wishlist")
      if (stored && stored.trim() !== "") {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        } else {
          console.error("[v0] Invalid wishlist data in localStorage, resetting")
          localStorage.removeItem("wishlist")
          setItems([])
        }
      } else {
        setItems([])
      }
    } catch (error) {
      console.error("[v0] Error parsing wishlist from localStorage:", error)
      localStorage.removeItem("wishlist")
      setItems([])
    }
  }

  const saveToLocalStorage = (newItems: WishlistItem[]) => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(newItems))
    } catch (error) {
      console.error("[v0] Error saving wishlist to localStorage:", error)
    }
  }

  const toggleLike = async (product: WishlistItem) => {
    const isCurrentlyLiked = items.some((item) => item.id === product.id)

    if (isCurrentlyLiked) {
      const newItems = items.filter((item) => item.id !== product.id)
      setItems(newItems)
      saveToLocalStorage(newItems)

      if (userId) {
        const { error } = await supabase.from("user_likes").delete().eq("user_id", userId).eq("product_id", product.id)

        if (error) {
          console.error("[v0] Error removing like from database:", error)
        }
      }
    } else {
      const newItems = [...items, product]
      setItems(newItems)
      saveToLocalStorage(newItems)

      setToastState({
        isVisible: true,
        productName: product.name,
        productImage: product.image,
      })

      if (userId) {
        const { error } = await supabase.from("user_likes").insert({
          user_id: userId,
          product_id: product.id,
        })

        if (error) {
          console.error("[v0] Error adding like to database:", error)
        }
      }
    }
  }

  const isLiked = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  const openWishlist = () => setIsOpen(true)
  const closeWishlist = () => setIsOpen(false)
  const getItemCount = () => items.length

  const handleCloseToast = () => {
    setToastState((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        isOpen,
        openWishlist,
        closeWishlist,
        toggleLike,
        isLiked,
        getItemCount,
        isLoading,
      }}
    >
      {children}
      <WishlistToast
        isVisible={toastState.isVisible}
        productName={toastState.productName}
        productImage={toastState.productImage}
        onClose={handleCloseToast}
      />
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
