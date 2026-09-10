import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?error=unauthorized")
  }

  return { user, supabase }
}

export async function requireSupplier() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is supplier or admin (admins can access supplier dashboard)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "supplier" && profile.role !== "admin")) {
    redirect("/admin/login?error=unauthorized")
  }

  return { user, supabase, profile }
}

export async function requireAdminOrSupplier() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is admin or supplier
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "supplier")) {
    redirect("/admin/login?error=unauthorized")
  }

  return { user, supabase, profile }
}

export async function requireDistributor() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is distributor or admin (admins can access distributor dashboard)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "distributor" && profile.role !== "admin")) {
    redirect("/admin/login?error=unauthorized")
  }

  return { user, supabase, profile }
}
