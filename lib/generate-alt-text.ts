export interface AltTextParams {
  brand?: string | null
  productName: string
  imageIndex: number
}

const viewDescriptions = ["full front view", "side profile view", "close-up detail view", "back view", "detail view"]

export function generateAltText({ brand, productName, imageIndex }: AltTextParams): string {
  const viewDescription = viewDescriptions[imageIndex] || "detail view"

  if (brand) {
    return `${brand} ${productName} – ${viewDescription} in premium quality with AA+ craftsmanship`
  }

  return `${productName} – ${viewDescription} in premium quality with AA+ craftsmanship`
}
