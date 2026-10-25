export type CheckoutMode = "manual" | "mollie"

/**
 * Orders submitted while CHECKOUT_MODE=manual are stored with these values.
 * The orders table only accepts payment_method in (paypal, mollie, bank_transfer) and
 * status in (pending, processing, completed, cancelled), so a manual order is a
 * regular "pending" order whose payment_status marks it as awaiting stock confirmation.
 * No Mollie payment exists for it and it is never marked as paid.
 */
export const MANUAL_ORDER_PAYMENT_STATUS = "awaiting_confirmation"

/**
 * Server-side switch between the two checkout flows.
 *
 *   CHECKOUT_MODE=manual  -> save the order, show the Saint Yve confirmation page (default)
 *   CHECKOUT_MODE=mollie  -> original flow: save the order and redirect to Mollie
 *
 * Only call this from server code (server actions, route handlers, server components).
 */
export function getCheckoutMode(): CheckoutMode {
  return process.env.CHECKOUT_MODE?.trim().toLowerCase() === "mollie" ? "mollie" : "manual"
}

export function isManualOrder(order: { payment_status?: string | null }): boolean {
  return order.payment_status === MANUAL_ORDER_PAYMENT_STATUS
}
