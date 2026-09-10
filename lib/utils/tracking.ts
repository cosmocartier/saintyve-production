export function getTrackingUrl(courier: string, trackingNumber: string): string {
  const courierLower = courier.toLowerCase()

  if (courierLower.includes("dhl")) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  } else if (courierLower.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  } else if (courierLower.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`
  } else if (courierLower.includes("usps")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  } else if (courierLower.includes("dpd")) {
    return `https://tracking.dpd.de/parcelstatus?query=${trackingNumber}`
  } else if (courierLower.includes("hermes")) {
    return `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation#${trackingNumber}`
  } else if (courierLower.includes("gls")) {
    return `https://gls-group.eu/EU/en/parcel-tracking?match=${trackingNumber}`
  }

  // Default fallback - Google search for tracking number
  return `https://www.google.com/search?q=${encodeURIComponent(courier + " tracking " + trackingNumber)}`
}
