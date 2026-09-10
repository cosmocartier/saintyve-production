"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AccessOverlay } from "@/components/access/access-overlay"
import { getAccessSession } from "@/lib/access-auth"

const EXCLUDED_PATHS = ["/members/registration"]

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const pathname = usePathname()

  const isExcluded = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path))

  useEffect(() => {
    if (isExcluded) return
    getAccessSession().then((user) => {
      setIsAuthenticated(!!user)
    })
  }, [isExcluded])

  // Don't render the overlay until we know the auth state, or on excluded paths
  if (isExcluded || isAuthenticated === null) return <>{children}</>

  return (
    <>
      {!isAuthenticated && (
        <AccessOverlay onSuccess={() => setIsAuthenticated(true)} />
      )}
      {children}
    </>
  )
}
