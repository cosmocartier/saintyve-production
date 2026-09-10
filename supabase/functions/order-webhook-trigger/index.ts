// Supabase Edge Function to trigger webhook on order creation
// Deploy this function to Supabase and set up a database trigger

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Import Deno to fix undeclared variable error

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    console.log("[v0] Edge function triggered")

    const payload = await req.json()
    console.log("[v0] Payload received:", {
      type: payload.type,
      table: payload.table,
      record_id: payload.record?.id,
    })

    // Get webhook URL from environment
    const webhookUrl = Deno.env.get("WEBHOOK_URL")
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET")

    if (!webhookUrl) {
      throw new Error("WEBHOOK_URL not configured")
    }

    // Forward the payload to your Next.js webhook endpoint
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": webhookSecret || "",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Webhook call failed:", errorText)
      throw new Error(`Webhook failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Webhook call successful:", result)

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("[v0] Edge function error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
