export async function sendPlatinumActivationEmail({
  customerEmail,
  customerName,
  cardFrontUrl,
  cardBackUrl,
}: {
  customerEmail: string
  customerName: string
  cardFrontUrl?: string
  cardBackUrl?: string
}) {
  try {
    console.log("[v0] Sending platinum email function called")
    console.log("[v0] Customer:", customerEmail, customerName)
    console.log("[v0] Cards:", cardFrontUrl ? "front present" : "no front", cardBackUrl ? "back present" : "no back")

    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return false
    }

    console.log("[v0] RESEND_API_KEY is configured")

    const signInUrl = "https://www.designerdrip.store/auth/login"

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Designerdrip Platinum Membership is now active</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 24px 24px 16px; text-align: left; border-bottom: 1px solid #f0f0f0;">
                <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #888888; margin-bottom: 6px;">
                  DESIGNERDRIP LOYALTY
                </div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111111;">
                  Welcome to Platinum.
                </h1>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding: 20px 24px;">
                <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #333333;">
                  Hi ${customerName},
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                  Your Designerdrip Platinum Membership is now active. From now on, your orders and requests are handled with the highest priority level in our system.
                </p>
              </td>
            </tr>

            <!-- Added membership card images section -->
            ${
              cardFrontUrl && cardBackUrl
                ? `
            <tr>
              <td style="padding: 0 24px 20px;">
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #111111; text-align: center;">Your Platinum Membership Card</p>
                </div>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding-right: 6px; width: 50%;">
                      <img 
                        src="${cardFrontUrl}" 
                        alt="Card Front" 
                        style="max-width: 100%; height: auto; border-radius: 8px; display: block; border: 1px solid #e0e0e0;"
                      />
                      <p style="margin: 4px 0 0; font-size: 11px; color: #888888; text-align: center;">Front</p>
                    </td>
                    <td style="padding-left: 6px; width: 50%;">
                      <img 
                        src="${cardBackUrl}" 
                        alt="Card Back" 
                        style="max-width: 100%; height: auto; border-radius: 8px; display: block; border: 1px solid #e0e0e0;"
                      />
                      <p style="margin: 4px 0 0; font-size: 11px; color: #888888; text-align: center;">Back</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            `
                : ""
            }

            <!-- Benefits Section -->
            <tr>
              <td style="padding: 0 24px 20px;">
                <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #111111;">
                  Your Platinum benefits
                </h2>
                <div style="padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 3px solid #E5E4E2;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #333333;">
                        • <strong>Monthly Platinum Rewards</strong> – free items & exclusive rewards every single month
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #333333;">
                        • <strong>Platinum Priority Fulfillment</strong> – your orders skip the entire queue
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #333333;">
                        • <strong>2×–3× Credit Multiplier</strong> – earn significantly more on select promotions
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #333333;">
                        • <strong>€50 Annual Platinum Credit</strong> – automatically added once per year
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #333333;">
                        • <strong>Signature Packaging Upgrade</strong> – elevated unboxing on every order
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; line-height: 1.6; color: #888888; font-style: italic;">
                        …and much more, exclusively for Platinum members
                      </td>
                    </tr>
                  </table>
                </div>
                <p style="margin: 12px 0 0; font-size: 12px; line-height: 1.6; color: #888888; text-align: center;">
                  Membership: 499 € · Estimated yearly value: ~1.000 €+
                </p>
              </td>
            </tr>

            <!-- Updated CTA button to link to sign-in page -->
            <tr>
              <td style="padding: 0 24px 24px; text-align: center;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 0 auto;">
                  <tr>
                    <td align="center" bgcolor="#111111" style="border-radius: 999px; background-color: #111111;">
                      <a href="${signInUrl}" style="display: inline-block; padding: 12px 32px; font-size: 14px; font-weight: 500; line-height: 1.4; color: #ffffff; text-decoration: none; border-radius: 999px; white-space: nowrap;">
                        View your Platinum benefits
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Closing copy -->
            <tr>
              <td style="padding: 0 24px 20px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333; text-align: center;">
                  If you have any special requests, sizing questions or sourcing wishes, simply reply to this email and we'll take care of it personally.
                </p>
              </td>
            </tr>

            <!-- Signature -->
            <tr>
              <td style="padding: 0 24px 24px; text-align: center;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333; font-weight: 500;">
                  DESIGNERDRIP
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 24px; border-top: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; line-height: 1.6; color: #888888;">
                  Questions? Contact us at <a href="mailto:loyalty@designerdrip.store" style="color: #555555; text-decoration: underline;">loyalty@designerdrip.store</a>
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

    console.log("[v0] Calling Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DESIGNERDRIP <loyalty@designerdrip.store>",
        to: customerEmail,
        subject: "Your Designerdrip Platinum Membership is now active",
        html: emailHtml,
      }),
    })

    console.log("[v0] Resend API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", JSON.stringify(errorData, null, 2))
      return false
    }

    const result = await response.json()
    console.log("[v0] Platinum activation email sent successfully:", JSON.stringify(result, null, 2))
    return true
  } catch (error) {
    console.error("[v0] Error sending Platinum activation email:", error)
    return false
  }
}
