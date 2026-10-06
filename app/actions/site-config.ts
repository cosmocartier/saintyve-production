"use server"

import { revalidatePath } from "next/cache"
import { supabaseServiceRole } from "@/lib/supabase/service-role"
import {
  DEFAULT_SITE_CONFIG,
  KEY_TO_FIELD,
  SITE_CONFIG_DEFINITIONS,
  type SiteConfigKey,
  type SiteConfigState,
} from "@/lib/site-config"

export async function getSiteConfig(): Promise<SiteConfigState> {
  const { data, error } = await supabaseServiceRole.from("site_configurations").select("key, enabled")

  if (error || !data) {
    return DEFAULT_SITE_CONFIG
  }

  const config = { ...DEFAULT_SITE_CONFIG }
  for (const row of data) {
    const field = KEY_TO_FIELD[row.key as SiteConfigKey]
    if (field) config[field] = Boolean(row.enabled)
  }
  return config
}

export async function setSiteConfigEnabled(key: SiteConfigKey, enabled: boolean): Promise<SiteConfigState> {
  await supabaseServiceRole
    .from("site_configurations")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key)

  revalidatePath("/", "layout")
  return getSiteConfig()
}

// Master toggle: a convenience action that sets every individual
// configuration to the same state at once. It is not a persistent gate —
// after calling this, each configuration remains independently toggleable.
export async function setAllSiteConfigsEnabled(enabled: boolean): Promise<SiteConfigState> {
  await supabaseServiceRole
    .from("site_configurations")
    .update({ enabled, updated_at: new Date().toISOString() })
    .in(
      "key",
      SITE_CONFIG_DEFINITIONS.map((d) => d.key),
    )

  revalidatePath("/", "layout")
  return getSiteConfig()
}
