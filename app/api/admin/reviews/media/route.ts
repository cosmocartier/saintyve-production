import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadToCloudflare, deleteFromCloudflare } from "@/lib/cloudflare/cloudflare-images"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

// Uploads review media to Cloudflare Images. The review row itself (and its
// `media` jsonb array) is written by the client via the normal Supabase
// mutation, matching how the review record's other fields are saved.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploaded: { cf_image_id: string }[] = []
    for (const file of files) {
      const cfImageId = await uploadToCloudflare(file)
      uploaded.push({ cf_image_id: cfImageId })
    }

    return NextResponse.json({ images: uploaded })
  } catch (error) {
    console.error("[Reviews Media] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const cfImageId = request.nextUrl.searchParams.get("cfImageId")
    if (!cfImageId) {
      return NextResponse.json({ error: "cfImageId is required" }, { status: 400 })
    }

    await deleteFromCloudflare(cfImageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Reviews Media] Delete error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 })
  }
}
