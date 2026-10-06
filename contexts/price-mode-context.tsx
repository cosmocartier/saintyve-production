"use client"

// Retail Price is now one configuration inside the broader site-config
// system (see contexts/site-config-context.tsx). This hook is kept so
// existing consumers don't need to change, and simply reads/writes the
// "retail_prices" configuration.
import { useSiteConfig } from "@/contexts/site-config-context"

export function usePriceMode() {
  const { config, toggleConfig } = useSiteConfig()
  return {
    useRetailPrice: config.retailPrices,
    togglePriceMode: () => toggleConfig("retail_prices"),
  }
}
