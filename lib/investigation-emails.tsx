export async function sendItemUnavailableEmail({
  customerEmail,
  customerName,
  orderNumber,
  unavailableItems,
  caseId,
  secureToken,
}: {
  customerEmail: string
  customerName: string
  orderNumber: string
  unavailableItems: Array<{
    product_name: string
    variant: { size?: string; color?: string }
    quantity: number
  }>
  caseId: string
  secureToken: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return false
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://designerdrip.store"
    const resolutionUrl = `${baseUrl}/order-issue/${caseId}?token=${secureToken}`
    console.log("[v0] === EMAIL URL GENERATION ===")
    console.log("[v0] Base URL:", baseUrl)
    console.log("[v0] Case ID:", caseId)
    console.log("[v0] Case ID Type:", typeof caseId)
    console.log("[v0] Complete Resolution URL:", resolutionUrl)
    console.log("[v0] Token (first 10 chars):", secureToken.substring(0, 10))
    console.log("[v0] ========================")

    const unavailableItemsHtml = unavailableItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
          <strong style="color: #111111;">${item.product_name}</strong>
          ${item.variant?.size ? `<br><span style="color: #888888; font-size: 13px;">Size: ${item.variant.size}</span>` : ""}
          ${item.variant?.color ? `<br><span style="color: #888888; font-size: 13px;">Color: ${item.variant.color}</span>` : ""}
        </td>
        <td align="center" style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #666666;">
          ${item.quantity}
        </td>
      </tr>
    `,
      )
      .join("")

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Issue with your order</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 24px 24px 16px; text-align: left; border-bottom: 1px solid #f0f0f0;">
                <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #ff6b6b; margin-bottom: 6px;">
                  Attention Required
                </div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #111111;">
                  There's an issue with your order
                </h1>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding: 20px 24px;">
                <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #333333;">
                  Hi ${customerName},
                </p>
                <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #333333;">
                  Unfortunately, some items from your order <strong>#${orderNumber}</strong> are currently not available from our supplier.
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                  We apologize for the inconvenience. Please choose an alternative item, and we'll get your order processed as soon as possible.
                </p>
              </td>
            </tr>

            <!-- Unavailable items -->
            <tr>
              <td style="padding: 0 24px 20px;">
                <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #111111;">
                  Unavailable Items
                </h2>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th align="left" style="padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Item</th>
                      <th align="center" style="padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${unavailableItemsHtml}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding: 0 24px 24px; text-align: center;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 0 auto;">
                  <tr>
                    <td align="center" bgcolor="#111111" style="border-radius: 999px; background-color: #111111;">
                      <a href="${resolutionUrl}" style="display: inline-block; padding: 12px 32px; font-size: 14px; font-weight: 500; line-height: 1.4; color: #ffffff; text-decoration: none; border-radius: 999px; white-space: nowrap;">
                        Choose an alternative
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 12px 0 0; font-size: 12px; line-height: 1.6; color: #888888;">
                  You can choose another item from our store or describe a custom item you'd like us to source.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 24px; border-top: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; line-height: 1.6; color: #888888;">
                  Questions? Contact us at <a href="mailto:support@designerdrip.store" style="color: #555555; text-decoration: underline;">support@designerdrip.store</a>
                </p>
                <p style="margin: 6px 0 0; font-size: 11px; line-height: 1.5; color: #aaaaaa;">
                  © ${new Date().getFullYear()} DESIGNERDRIP. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
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
        to: customerEmail,
        subject: "There's an issue with your Designerdrip order",
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] Item unavailable email sent successfully:", result)
    return true
  } catch (error) {
    console.error("[v0] Error sending item unavailable email:", error)
    return false
  }
}

export async function sendAlternativeConfirmedEmail({
  customerEmail,
  customerName,
  orderNumber,
  replacementItem,
}: {
  customerEmail: string
  customerName: string
  orderNumber: string
  replacementItem: {
    type: "store_link" | "custom"
    productLink?: string
    description?: string
  }
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return false
    }

    const replacementText =
      replacementItem.type === "store_link"
        ? `Product: ${replacementItem.productLink}`
        : `Custom item: ${replacementItem.description}`

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Replacement confirmed</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 24px 24px 16px; text-align: left; border-bottom: 1px solid #f0f0f0;">
                <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #10b981; margin-bottom: 6px;">
                  Confirmed
                </div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #111111;">
                  Your replacement item has been confirmed
                </h1>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding: 20px 24px;">
                <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #333333;">
                  Hi ${customerName},
                </p>
                <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #333333;">
                  Great news! We've confirmed your replacement item for order <strong>#${orderNumber}</strong>.
                </p>
                <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 3px solid #10b981;">
                  <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">
                    Replacement Item
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #111111;">
                    ${replacementText}
                  </p>
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                  Your order will now proceed with normal processing and shipping. You'll receive tracking information once your package ships.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 24px; border-top: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; line-height: 1.6; color: #888888;">
                  Questions? Contact us at <a href="mailto:support@designerdrip.store" style="color: #555555; text-decoration: underline;">support@designerdrip.store</a>
                </p>
                <p style="margin: 6px 0 0; font-size: 11px; line-height: 1.5; color: #aaaaaa;">
                  © ${new Date().getFullYear()} DESIGNERDRIP. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
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
        to: customerEmail,
        subject: "Your replacement item has been confirmed",
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] Alternative confirmed email sent successfully:", result)
    return true
  } catch (error) {
    console.error("[v0] Error sending alternative confirmed email:", error)
    return false
  }
}
