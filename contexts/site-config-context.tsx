"use client"

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react"
import { setAllSiteConfigsEnabled, setSiteConfigEnabled } from "@/app/actions/site-config"
import { SITE_CONFIG_DEFINITIONS, type SiteConfigField, type SiteConfigKey, type SiteConfigState } from "@/lib/site-config"

interface SiteConfigContextType {
  config: SiteConfigState
  /** True only while every configuration is enabled. Reflects state, not a gate. */
  isMasterOn: boolean
  isPending: boolean
  toggleConfig: (key: SiteConfigKey) => void
  toggleMaster: () => void
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

// Site-wide, server-persisted configuration. Any admin who flips a toggle
// changes the live site for every visitor — this is not per-browser state.
export function SiteConfigProvider({
  initialConfig,
  children,
}: {
  initialConfig: SiteConfigState
  children: React.ReactNode
}) {
  const [config, setConfig] = useState(initialConfig)
  const [isPending, startTransition] = useTransition()

  const toggleConfig = useCallback(
    (key: SiteConfigKey) => {
      const definition = SITE_CONFIG_DEFINITIONS.find((d) => d.key === key)
      if (!definition) return
      const field = definition.field as SiteConfigField
      const nextValue = !config[field]

      setConfig((prev) => ({ ...prev, [field]: nextValue }))
      startTransition(async () => {
        const result = await setSiteConfigEnabled(key, nextValue)
        setConfig(result)
      })
    },
    [config],
  )

  const toggleMaster = useCallback(() => {
    const allOn = SITE_CONFIG_DEFINITIONS.every((d) => config[d.field as SiteConfigField])
    const nextValue = !allOn

    setConfig((prev) => {
      const next = { ...prev }
      for (const d of SITE_CONFIG_DEFINITIONS) next[d.field as SiteConfigField] = nextValue
      return next
    })
    startTransition(async () => {
      const result = await setAllSiteConfigsEnabled(nextValue)
      setConfig(result)
    })
  }, [config])

  const isMasterOn = useMemo(
    () => SITE_CONFIG_DEFINITIONS.every((d) => config[d.field as SiteConfigField]),
    [config],
  )

  const value = useMemo(
    () => ({ config, isMasterOn, isPending, toggleConfig, toggleMaster }),
    [config, isMasterOn, isPending, toggleConfig, toggleMaster],
  )

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (context === undefined) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider")
  }
  return context
}
