import { createClient } from "@/lib/supabase/server"
import { CustomerResolutionClient } from "@/components/customer-resolution-client"

export const dynamic = "force-dynamic"

export default async function CustomerResolutionPage({
  params,
  searchParams,
}: {
  params: { caseId: string }
  searchParams: { token?: string }
}) {
  const supabase = await createClient()

  if (!searchParams.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-medium text-zinc-900 mb-3">Invalid Access</h1>
          <p className="text-sm text-zinc-600">
            This link is not valid. Please check your email for the correct link or contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  const { data: caseData, error } = await supabase
    .from("investigation_cases")
    .select(
      `
      *,
      orders (
        id,
        customer_name,
        customer_email,
        total,
        profiles (
          full_name,
          email
        )
      )
    `,
    )
    .eq("id", params.caseId)
    .single()

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl text-zinc-900 mb-3 font-medium">Case Not Found</h1>
          <p className="text-sm text-zinc-600">
            We couldn't find this investigation case. The link may be incorrect or the case may have been closed. Please
            contact support if you think this is a mistake.
          </p>
        </div>
      </div>
    )
  }

  // Extract and verify token from description
  const metadataMatch = caseData.description?.match(/Metadata: (.+)$/)
  let metadata = null
  if (metadataMatch) {
    try {
      metadata = JSON.parse(metadataMatch[1])
    } catch (e) {
      // Failed to parse metadata
    }
  }

  if (!metadata || metadata.token !== searchParams.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-medium text-zinc-900 mb-3">Invalid or Expired Link</h1>
          <p className="text-sm text-zinc-600">
            This link is invalid or has expired. Please contact support if you need assistance with your order.
          </p>
        </div>
      </div>
    )
  }

  // Parse unavailable items
  const unavailableMatch = caseData.description?.match(/Unavailable Items:\n([\s\S]+?)\n\n---/)
  let unavailableItems = []
  if (unavailableMatch) {
    try {
      unavailableItems = JSON.parse(unavailableMatch[1])
    } catch (e) {
      // Failed to parse unavailable items
    }
  }

  // Check if customer has already responded
  const customerResponseReceived = metadata.customerResponseReceived || false

  return (
    <CustomerResolutionClient
      caseId={params.caseId}
      orderNumber={caseData.orders.id.slice(0, 8).toUpperCase()}
      unavailableItems={unavailableItems}
      customerResponseReceived={customerResponseReceived}
    />
  )
}
