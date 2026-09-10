"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface PriceModeContextType {
  useRetailPrice: boolean
  togglePriceMode: () => void
}

const PriceModeContext = createContext<PriceModeContextType | undefined>(undefined)

export function PriceModeProvider({ children }: { children: React.ReactNode }) {
  const [useRetailPrice, setUseRetailPrice] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("useRetailPrice")
    if (saved) {
      setUseRetailPrice(saved === "true")
    }
  }, [])

  const togglePriceMode = () => {
    setUseRetailPrice((prev) => {
      const newValue = !prev
      localStorage.setItem("useRetailPrice", String(newValue))
      return newValue
    })
  }

  return (
    <PriceModeContext.Provider value={{ useRetailPrice, togglePriceMode }}>
      {children}
    </PriceModeContext.Provider>
  )
}

export function usePriceMode() {
  const context = useContext(PriceModeContext)
  if (context === undefined) {
    throw new Error("usePriceMode must be used within a PriceModeProvider")
  }
  return context
}
