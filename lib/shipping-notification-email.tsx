export async function sendShippingNotificationEmail({
  order,
  orderItems,
  trackingInfo,
}: {
  order: any
  orderItems: any[]
  trackingInfo: {
    carrier: string
    trackingNumber: string
    trackingUrl?: string
  }
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return false
    }

    const customerFirstName = order.shipping_address?.firstName || order.customer_name?.split(" ")[0] || "there"
    const orderIdShort = order.id.slice(0, 8).toUpperCase()

    // Build tracking URL if not provided
    const trackingUrl =
      trackingInfo.trackingUrl || `https://www.17track.net/en/track?nums=${trackingInfo.trackingNumber}`

    const orderItemsHtml = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.products?.name || "Product"}</strong>
          ${item.product_variants?.size ? `<br><span style="color: #6b7280; font-size: 13px;">Size: ${item.product_variants.size}</span>` : ""}
          ${item.product_variants?.color ? `<br><span style="color: #6b7280; font-size: 13px;">Color: ${item.product_variants.color}</span>` : ""}
        </td>
        <td align="center" style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
      </tr>
    `,
      )
      .join("")

    const emailHtml = `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your order has shipped • #${orderIdShort}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;
      }
      a {
        color: #111111;
        text-decoration: none;
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Helvetica, Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      style="border-collapse: collapse; background-color: #f5f5f5;"
    >
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <!-- Card -->
          <table
            role="presentation"
            width="100%"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="
              max-width: 560px;
              width: 100%;
              border-collapse: collapse;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  padding: 20px 24px 12px;
                  text-align: left;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: #10b981;
                    margin-bottom: 4px;
                    font-weight: 600;
                  "
                >
                  Order shipped
                </div>
                <h1
                  style="
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #111111;
                  "
                >
                  Hey ${customerFirstName}
                </h1>
                <p
                  style="
                    margin: 8px 0 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #111111;
                  "
                >
                  Your order #${orderIdShort} is on its way.
                </p>
              </td>
            </tr>

            <!-- Tracking info block -->
            <tr>
              <td
                style="
                  padding: 20px 24px;
                  background-color: #f9fafb;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                <h2
                  style="
                    margin: 0 0 12px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #111111;
                  "
                >
                  Tracking Information
                </h2>
                <table
                  role="presentation"
                  width="100%"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  style="border-collapse: collapse; font-size: 13px;"
                >
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Carrier</td>
                    <td
                      style="
                        padding: 6px 0;
                        text-align: right;
                        color: #111111;
                        font-weight: 600;
                      "
                    >
                      ${trackingInfo.carrier}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">
                      Tracking number
                    </td>
                    <td
                      style="
                        padding: 6px 0;
                        text-align: right;
                        color: #111111;
                        font-family: 'Courier New', monospace;
                        font-weight: 500;
                      "
                    >
                      ${trackingInfo.trackingNumber}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Track button -->
            <tr>
              <td style="padding: 20px 24px; text-align: center;">
                <table
                  role="presentation"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  style="border-collapse: collapse; margin: 0 auto;"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#111111"
                      style="
                        border-radius: 999px;
                        background-color: #111111;
                      "
                    >
                      <a
                        href="${trackingUrl}"
                        style="
                          display: inline-block;
                          padding: 12px 32px;
                          font-size: 14px;
                          font-weight: 500;
                          line-height: 1.4;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 999px;
                          white-space: nowrap;
                        "
                      >
                        Track your package
                      </a>
                    </td>
                  </tr>
                </table>
                <p
                  style="
                    margin: 12px 0 0;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #9b9b9b;
                  "
                >
                  Or copy this link:<br />
                  <a
                    href="${trackingUrl}"
                    style="color: #555555; text-decoration: underline;"
                    >${trackingUrl}</a
                  >
                </p>
              </td>
            </tr>

            <!-- Order items -->
            <tr>
              <td
                style="
                  padding: 16px 24px 8px;
                  border-top: 1px solid #eeeeee;
                "
              >
                <h2
                  style="
                    margin: 0 0 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #111111;
                  "
                >
                  Items in this shipment
                </h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 24px 16px;">
                <table
                  role="presentation"
                  width="100%"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                  style="
                    border-collapse: collapse;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    font-size: 13px;
                  "
                >
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th
                        align="left"
                        style="
                          padding: 10px 12px;
                          font-weight: 600;
                          border-bottom: 1px solid #e5e7eb;
                        "
                      >
                        Product
                      </th>
                      <th
                        align="center"
                        style="
                          padding: 10px 12px;
                          font-weight: 600;
                          border-bottom: 1px solid #e5e7eb;
                        "
                      >
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                  </tbody>
                </table>
              </td>
            </tr>

            ${
              order.shipping_address
                ? `
            <!-- Shipping address -->
            <tr>
              <td style="padding: 16px 24px 18px; border-top: 1px solid #eeeeee;">
                <h2
                  style="
                    margin: 0 0 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #111111;
                  "
                >
                  Shipping to
                </h2>
                <div
                  style="
                    padding: 10px 12px;
                    background-color: #f9fafb;
                    border-radius: 8px;
                    font-size: 13px;
                    line-height: 1.7;
                    color: #374151;
                  "
                >
                  ${order.shipping_address.firstName || ""} ${order.shipping_address.lastName || ""}<br />
                  ${order.shipping_address.address || ""}<br />
                  ${order.shipping_address.apartment ? `${order.shipping_address.apartment}<br />` : ""}
                  ${order.shipping_address.city || ""}, ${order.shipping_address.postalCode || ""}<br />
                  ${order.shipping_address.country || ""}${
                    order.shipping_address.phone ? `<br />Phone: ${order.shipping_address.phone}` : ""
                  }
                </div>
              </td>
            </tr>
            `
                : ""
            }

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 16px 24px 20px;
                  border-top: 1px solid #eeeeee;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #6b7280;
                  "
                >
                  Questions about your order? Contact us at
                  <a
                    href="mailto:support@designerdrip.store"
                    style="color: #111111; text-decoration: underline;"
                    >support@designerdrip.store</a
                  >
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #9b9b9b;
                  "
                >
                  DESIGNERDRIP • Dubai Silicon Oasis, UAE •
                  <a
                    href="https://designerdrip.store"
                    style="color: #9b9b9b; text-decoration: underline;"
                    >designerdrip.store</a
                  >
                </p>
              </td>
            </tr>
          </table>
          <!-- End Card -->
        </td>
      </tr>
    </table>
  </body>
</html>
`

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DESIGNERDRIP <orders@designerdrip.store>",
        to: order.customer_email,
        subject: `Your Designerdrip order has been shipped — Tracking inside`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] Shipping notification sent successfully:", result)

    return true
  } catch (error) {
    console.error("[v0] Error sending shipping notification:", error)
    return false
  }
}
