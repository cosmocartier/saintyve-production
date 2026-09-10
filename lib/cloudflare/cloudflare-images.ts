// Cloudflare Images API utilities

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!
const CF_IMAGES_API_TOKEN = process.env.CF_IMAGES_API_TOKEN!
const CF_IMAGE_DELIVERY_BASE = process.env.NEXT_PUBLIC_CF_IMAGE_DELIVERY_BASE!

if (!CF_ACCOUNT_ID || !CF_IMAGES_API_TOKEN) {
  console.warn("[CF Images] Missing CF_ACCOUNT_ID or CF_IMAGES_API_TOKEN environment variables")
}

if (!CF_IMAGE_DELIVERY_BASE) {
  console.warn("[CF Images] Missing NEXT_PUBLIC_CF_IMAGE_DELIVERY_BASE environment variable")
}

export type CFImageVariant = "grid" | "pdp" | "zoom" | "public" | "watermark"

/**
 * Build Cloudflare Images delivery URL
 */
export function buildCfUrl(imageId: string, variant: CFImageVariant = "pdp"): string {
  return `${CF_IMAGE_DELIVERY_BASE}/${imageId}/${variant}`
}

/**
 * Upload image to Cloudflare Images
 */
export async function uploadToCloudflare(file: File | Buffer, metadata?: { productId: string }): Promise<string> {
  const formData = new FormData()

  if (file instanceof Buffer) {
    formData.append("file", new Blob([file]), "image.jpg")
  } else {
    formData.append("file", file)
  }

  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata))
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudflare upload failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (!data.success || !data.result?.id) {
    throw new Error("Cloudflare upload failed: Invalid response")
  }

  return data.result.id
}

/**
 * Delete image from Cloudflare Images
 */
export async function deleteFromCloudflare(imageId: string): Promise<void> {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${imageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    // 404 is okay - image already deleted
    const errorText = await response.text()
    throw new Error(`Cloudflare delete failed: ${response.status} ${errorText}`)
  }
}

/**
 * Build structured image object with all variants
 */
export function buildImageObject(image: {
  id: string
  url?: string
  cf_image_id?: string
  alt_text: string | null
  role?: string
}) {
  const isCfImage = !!image.cf_image_id

  if (isCfImage) {
    return {
      id: image.id,
      thumbSrc: buildCfUrl(image.cf_image_id!, "grid"),
      pdpSrc: buildCfUrl(image.cf_image_id!, "pdp"),
      zoomSrc: buildCfUrl(image.cf_image_id!, "zoom"),
      alt: image.alt_text || "",
      role: image.role || "gallery",
    }
  }

  // Legacy Supabase image
  return {
    id: image.id,
    thumbSrc: image.url || "",
    pdpSrc: image.url || "",
    zoomSrc: image.url || "",
    alt: image.alt_text || "",
    role: image.role || "gallery",
  }
}
