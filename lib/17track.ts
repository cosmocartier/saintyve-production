export type AddressPayload = {
  country?: string | null
  state?: string | null
  city?: string | null
  street?: string | null
  postal_code?: string | null
}

export type RegisterTrackingPayload = {
  number: string
  carrier?: number
  tag?: string
  track_info?: {
    shipping_info?: {
      shipper_address?: AddressPayload
      recipient_address?: AddressPayload
    }
    misc_info?: {
      customer_number?: string | null
      reference_number?: string | null
    }
  }
  destination_postal_code?: string | null
  destination_country?: string | null
  destination_city?: string | null
  ship_date?: string | null // YYYY-MM-DD
  consignee?: string | null
  phone_number_last_4?: string | null
}

export function getPhoneLast4(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 4 ? digits.slice(-4) : null
}

export function buildRecipientAddress(shippingAddress: {
  country?: string | null
  state?: string | null
  city?: string | null
  address?: string | null
  apartment?: string | null
  postalCode?: string | null
}): AddressPayload | undefined {
  const { country, state, city, address, apartment, postalCode } = shippingAddress

  // Only build address if we have at least some data
  if (!country && !state && !city && !address && !postalCode) {
    return undefined
  }

  // Combine street and apartment if both exist
  let street: string | null = null
  if (address && apartment) {
    street = `${address}, ${apartment}`
  } else if (address) {
    street = address
  }

  return {
    country: country || null,
    state: state || null,
    city: city || null,
    street: street,
    postal_code: postalCode || null,
  }
}

export async function registerTrackingNumbers(payloads: RegisterTrackingPayload[]): Promise<any> {
  const apiKey = process.env.SEVENTEENTRACK_API_KEY
  const apiBase = process.env.SEVENTEENTRACK_API_BASE

  if (!apiKey || !apiBase) {
    throw new Error("17TRACK API credentials not configured")
  }

  console.log("[v0] Registering tracking numbers with 17TRACK:", JSON.stringify(payloads, null, 2))

  const response = await fetch(`${apiBase}/register`, {
    method: "POST",
    headers: {
      "17token": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloads),
  })

  const text = await response.text()
  console.log("[17TRACK RAW RESPONSE]", response.status, text)

  if (!response.ok) {
    throw new Error(`17TRACK API failed: ${response.status} - ${text}`)
  }

  const result = JSON.parse(text)

  if (result.data?.rejected && result.data.rejected.length > 0) {
    const rejectedDetails = JSON.stringify(result.data.rejected)
    throw new Error(`17TRACK rejected trackings: ${rejectedDetails}`)
  }

  console.log("[v0] 17TRACK registration successful:", result)

  return result
}
