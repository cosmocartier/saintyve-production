"use client"

import { createClient } from "@/lib/supabase/client"

export async function signInWithCredentials(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data?.user) {
    return { user: null, error, accessPending: false }
  }

  // Check access_granted on the profile and grab first_name
  const { data: profile } = await supabase
    .from("profiles")
    .select("access_granted, first_name")
    .eq("id", data.user.id)
    .single()

  if (!profile?.access_granted) {
    // Sign them back out — account exists but access not yet approved
    await supabase.auth.signOut()
    return { user: null, error: null, accessPending: true, firstName: null }
  }

  return { user: data.user, error: null, accessPending: false, firstName: profile.first_name as string | null }
}

export async function getAccessSession() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Also verify access_granted before allowing through
  const { data: profile } = await supabase
    .from("profiles")
    .select("access_granted")
    .eq("id", user.id)
    .single()

  if (!profile?.access_granted) {
    await supabase.auth.signOut()
    return null
  }

  return user
}
