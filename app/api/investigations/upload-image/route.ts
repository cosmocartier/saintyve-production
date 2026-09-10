import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] [SERVER] Upload image API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("caseId") as string

    if (!file) {
      console.log("[v0] [SERVER] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!caseId) {
      console.log("[v0] [SERVER] No caseId provided")
      return NextResponse.json({ error: "No caseId provided" }, { status: 400 })
    }

    console.log("[v0] [SERVER] File received:", file.name, file.size, "bytes")
    console.log("[v0] [SERVER] Case ID:", caseId)

    const blobPath = `investigation-images/${caseId}-${Date.now()}-${file.name}`
    console.log("[v0] [SERVER] Uploading to blob path:", blobPath)

    const blob = await put(blobPath, file, {
      access: "public",
    })

    console.log("[v0] [SERVER] Upload successful!")
    console.log("[v0] [SERVER] Blob URL:", blob.url)

    return NextResponse.json({ imageUrl: blob.url })
  } catch (error) {
    console.error("[v0] [SERVER] Upload failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 },
    )
  }
}
