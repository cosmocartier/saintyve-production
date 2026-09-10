import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      caseId,
      resolutionType,
      productLink,
      linkNotes,
      customDescription,
      imageUrl,
      refundReason,
      refundMethod,
      refundDetails,
      refundName,
    } = body

    console.log("[v0] [API] Customer response API called")
    console.log("[v0] [API] Request body:", JSON.stringify(body, null, 2))

    if (!caseId) {
      console.error("[v0] [API] Missing caseId in request")
      return Response.json({ error: "Case ID is required" }, { status: 400 })
    }

    if (!resolutionType) {
      console.error("[v0] [API] Missing resolutionType in request")
      return Response.json({ error: "Resolution type is required" }, { status: 400 })
    }

    let dbResolutionType: string
    if (resolutionType === "custom") {
      dbResolutionType = "custom_request"
    } else if (resolutionType === "refund") {
      dbResolutionType = "refund_request"
    } else {
      dbResolutionType = "store_link"
    }
    console.log("[v0] [API] Mapping resolution type:", resolutionType, "->", dbResolutionType)

    if (resolutionType === "refund") {
      if (!refundReason?.trim()) {
        return Response.json({ error: "Refund reason is required" }, { status: 400 })
      }
      if (!refundMethod) {
        return Response.json({ error: "Refund method is required" }, { status: 400 })
      }
      if (!refundDetails?.trim()) {
        return Response.json({ error: "Refund details are required for the selected payment method" }, { status: 400 })
      }
      if (refundMethod === "iban" && !refundName?.trim()) {
        return Response.json({ error: "Account holder name is required for bank transfers" }, { status: 400 })
      }
    }

    const supabase = await createClient()

    console.log("[v0] [API] Fetching case from database...")
    const { data: caseData, error: fetchError } = await supabase
      .from("investigation_cases")
      .select("id, status, order_id")
      .eq("id", caseId)
      .single()

    if (fetchError) {
      console.error("[v0] [API] Database error fetching case:", fetchError)
      return Response.json({ error: `Case not found: ${fetchError.message}` }, { status: 404 })
    }

    if (!caseData) {
      console.error("[v0] [API] Case not found in database")
      return Response.json({ error: "Investigation case not found" }, { status: 404 })
    }

    console.log("[v0] [API] Found case:", caseData)

    console.log("[v0] [API] Checking for existing resolution...")
    const { data: existingResolution, error: checkError } = await supabase
      .from("investigation_case_resolutions")
      .select("id")
      .eq("case_id", caseId)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] [API] Error checking existing resolution:", checkError)
    }

    if (existingResolution) {
      console.log("[v0] [API] Resolution already exists, updating...")
      const { error: updateError } = await supabase
        .from("investigation_case_resolutions")
        .update({
          resolution_type: dbResolutionType,
          product_link: productLink || null,
          link_notes: linkNotes || null,
          custom_description: customDescription || null,
          image_url: imageUrl || null,
          refund_reason: refundReason || null,
          refund_method: refundMethod || null,
          refund_details: refundDetails || null,
          refund_name: refundName || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingResolution.id)

      if (updateError) {
        console.error("[v0] [API] Error updating resolution:", updateError)
        return Response.json({ error: `Failed to update resolution: ${updateError.message}` }, { status: 500 })
      }
      console.log("[v0] [API] Resolution updated successfully")
    } else {
      console.log("[v0] [API] Creating new resolution...")
      const insertData = {
        case_id: caseId,
        resolution_type: dbResolutionType,
        product_link: productLink || null,
        link_notes: linkNotes || null,
        custom_description: customDescription || null,
        image_url: imageUrl || null,
        refund_reason: refundReason || null,
        refund_method: refundMethod || null,
        refund_details: refundDetails || null,
        refund_name: refundName || null,
      }
      console.log("[v0] [API] Insert data:", JSON.stringify(insertData, null, 2))

      const { error: insertError, data: insertedData } = await supabase
        .from("investigation_case_resolutions")
        .insert(insertData)
        .select()

      if (insertError) {
        console.error("[v0] [API] Error inserting resolution:", insertError)
        return Response.json({ error: `Failed to save resolution: ${insertError.message}` }, { status: 500 })
      }
      console.log("[v0] [API] Resolution created successfully:", insertedData)
    }

    console.log("[v0] [API] Updating case status to in_progress...")
    const { error: updateCaseError } = await supabase
      .from("investigation_cases")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId)

    if (updateCaseError) {
      console.error("[v0] [API] Error updating case status:", updateCaseError)
      return Response.json({ error: `Failed to update case status: ${updateCaseError.message}` }, { status: 500 })
    }

    console.log("[v0] [API] Customer response successfully saved")
    return Response.json({ success: true, message: "Response submitted successfully" })
  } catch (error) {
    console.error("[v0] [API] Unexpected error:", error)
    return Response.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
