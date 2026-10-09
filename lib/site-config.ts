// Single source of truth for every site-wide, admin-controlled configuration.
// To add a new configuration: add a row to `site_configurations` (see
// scripts/create-site-configurations-table.sql) and a definition below. No
// other part of this system needs to change — the admin UI, the master
// toggle, and the provider all derive from this list.
export const SITE_CONFIG_DEFINITIONS = [
  { key: "retail_prices", field: "retailPrices", label: "Retail Prices" },
  { key: "landing_page", field: "landingPage", label: "Landing Page" },
  { key: "menu", field: "menu", label: "Menu" },
] as const

export type SiteConfigKey = (typeof SITE_CONFIG_DEFINITIONS)[number]["key"]
export type SiteConfigField = (typeof SITE_CONFIG_DEFINITIONS)[number]["field"]

export type SiteConfigState = {
  [K in SiteConfigField]: boolean
}

export const KEY_TO_FIELD = Object.fromEntries(SITE_CONFIG_DEFINITIONS.map((d) => [d.key, d.field])) as Record<
  SiteConfigKey,
  SiteConfigField
>

export const FIELD_TO_KEY = Object.fromEntries(SITE_CONFIG_DEFINITIONS.map((d) => [d.field, d.key])) as Record<
  SiteConfigField,
  SiteConfigKey
>

export const DEFAULT_SITE_CONFIG: SiteConfigState = Object.fromEntries(
  SITE_CONFIG_DEFINITIONS.map((d) => [d.field, false]),
) as SiteConfigState
