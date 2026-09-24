"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface CartItem {
  id: string
  name: string
  price: string
  image: string
  quantity: number
  variant?: string // Added optional variant field for size/color
  variantId?: string // Added variantId for database reference
  color?: string // Added color field to cart items for display
  isFreeReward?: boolean // Added flag to identify free reward items
  rewardId?: string // Added rewardId to track which loyalty reward this item came from
  slug?: string // Product slug used to build the canonical product URL (e.g. for WhatsApp ordering)
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, variant: string | undefined, quantity: number) => void
  clearCart: () => void // Added clearCart function
  openCart: () => void
  closeCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

// Single source of truth for parsing a cart item's displayed price (e.g. "EUR 1,349.00") into a
// number. Shared by getSubtotal below and by anything else (like checkout-attempt tracking)
// that needs the same numeric value. Strips currency symbols/labels AND thousands separators
// (commas) before parsing, since parseFloat stops at the first comma otherwise (e.g.
// "1,200.00" would parse as 1 instead of 1200).
export function parseCartPrice(price: string): number {
  return Number.parseFloat(price.replace(/€|EUR/g, "").replace(/,/g, "").trim()) || 0
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id && i.variant === item.variant)
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id && i.variant === item.variant ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prevItems, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove?.isFreeReward) {
        console.log("[v0] Cannot remove free reward item")
        return prevItems
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }, [])

  const updateQuantity = useCallback((id: string, variant: string | undefined, quantity: number) => {
    if (quantity < 1) return // Don't allow quantity less than 1

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id && item.variant === variant ? { ...item, quantity } : item)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setIsOpen(false)
  }, [])

  const openCart = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
  }, [])

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => {
      return total + parseCartPrice(item.price) * item.quantity
    }, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
