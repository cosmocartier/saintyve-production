import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) {
    console.log("[v0] Webhook request received:", request.nextUrl.pathname)
    return NextResponse.next()
  }

  const response = await updateSession(request)

  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Check user role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (request.nextUrl.pathname.startsWith("/admin/supplier")) {
      if (!profile || (profile.role !== "supplier" && profile.role !== "admin")) {
        return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url))
      }
    } else {
      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
