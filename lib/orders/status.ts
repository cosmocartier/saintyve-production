// Order status helpers for routing logic

/**
 * Check if order is paid or beyond (processing, shipped, fulfilled, delivered, completed)
 */
export function isPaidOrBeyond(status: string): boolean {
  return ["paid", "processing", "shipped", "fulfilled", "delivered", "completed"].includes(status.toLowerCase())
}

/**
 * Check if order requires payment
 * For bank transfers, pending status means awaiting payment
 * This should be used with payment_method check for proper routing
 */
export function isPaymentRequired(status: string, paymentMethod?: string): boolean {
  // If status is pending and payment method is bank_transfer, payment is required
  if (status.toLowerCase() === "pending" && paymentMethod === "bank_transfer") {
    return true
  }
  return false
}

/**
 * Check if order is under review (payment proof submitted but not yet approved)
 */
export function isUnderReview(status: string): boolean {
  return status.toLowerCase() === "under_review"
}

/**
 * Check if order needs to show payment page
 * Returns true if order is pending with bank_transfer payment method
 */
export function needsPaymentPage(status: string, paymentMethod?: string): boolean {
  return status.toLowerCase() === "pending" && paymentMethod === "bank_transfer"
}
