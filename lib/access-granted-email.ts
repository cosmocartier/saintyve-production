export async function sendAccessGrantedEmail({
  customerEmail,
  customerName,
  couponCode,
}: {
  customerEmail: string
  customerName: string
  couponCode: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[access-granted-email] RESEND_API_KEY not configured")
    return false
  }

  const shopUrl = "https://www.designerdrip.store"

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You have been granted access — Designerdrip</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #0a0a0a;">
      <tr>
        <td align="center" style="padding: 48px 16px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; width: 100%; border-collapse: collapse;">

            <!-- Wordmark -->
            <tr>
              <td style="padding-bottom: 48px; text-align: center;">
                <p style="margin: 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #444240;">
                  DESIGNERDRIP
                </p>
              </td>
            </tr>

            <!-- Thin rule -->
            <tr>
              <td style="padding-bottom: 48px;">
                <div style="height: 1px; background-color: #1e1e1e;"></div>
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td style="padding-bottom: 32px; text-align: center;">
                <p style="margin: 0 0 14px; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #555250;">
                  Private Access
                </p>
                <h1 style="margin: 0; font-size: 26px; font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; color: #ffffff; line-height: 1.3;">
                  You Are In.
                </h1>
              </td>
            </tr>

            <!-- Body copy -->
            <tr>
              <td style="padding-bottom: 40px; text-align: center;">
                <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.8; color: #aaaaaa; letter-spacing: 0.02em;">
                  ${customerName ? `${customerName},` : ""}
                </p>
                <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.8; color: #888888; letter-spacing: 0.02em;">
                  Your application has been reviewed and approved. You are now part of a closed circle — a community built for those who move differently, dress intentionally, and value the rare over the ordinary.
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #888888; letter-spacing: 0.02em;">
                  We handpick every member. You were chosen for a reason.
                </p>
              </td>
            </tr>

            <!-- Thin rule -->
            <tr>
              <td style="padding-bottom: 40px;">
                <div style="height: 1px; background-color: #1e1e1e;"></div>
              </td>
            </tr>

            <!-- Coupon block -->
            <tr>
              <td style="padding-bottom: 12px; text-align: center;">
                <p style="margin: 0 0 20px; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #555250;">
                  A Welcome Gift
                </p>
                <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.7; color: #888888; letter-spacing: 0.02em;">
                  As a token of welcome, we have prepared an exclusive 15% discount for your first order.
                  This code is personal — it works once and expires in 24 hours.
                </p>
                <!-- Coupon code box -->
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 0 auto 20px;">
                  <tr>
                    <td style="border: 1px solid #2e2e2e; padding: 16px 32px; text-align: center;">
                      <p style="margin: 0 0 6px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #555250;">
                        Your Code
                      </p>
                      <p style="margin: 0; font-size: 20px; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; color: #ffffff;">
                        ${couponCode}
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin: 0; font-size: 11px; letter-spacing: 0.08em; color: #444240;">
                  Valid for 24 hours · Single use · 15% off your entire order
                </p>
              </td>
            </tr>

            <!-- Thin rule -->
            <tr>
              <td style="padding: 40px 0;">
                <div style="height: 1px; background-color: #1e1e1e;"></div>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding-bottom: 48px; text-align: center;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 0 auto;">
                  <tr>
                    <td style="background-color: #ffffff;">
                      <a href="${shopUrl}" style="display: inline-block; padding: 14px 40px; font-size: 11px; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: #0a0a0a; text-decoration: none;">
                        Enter Designerdrip
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Thin rule -->
            <tr>
              <td style="padding-bottom: 40px;">
                <div style="height: 1px; background-color: #1e1e1e;"></div>
              </td>
            </tr>

            <!-- Closing -->
            <tr>
              <td style="padding-bottom: 48px; text-align: center;">
                <p style="margin: 0 0 14px; font-size: 13px; line-height: 1.8; color: #666360; letter-spacing: 0.02em;">
                  This is just the beginning. Expect exclusive drops, early access, and pieces that never reach the public — reserved only for members like you.
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #666360; letter-spacing: 0.02em;">
                  Thank you for being part of the family.
                </p>
              </td>
            </tr>

            <!-- Footer wordmark -->
            <tr>
              <td style="padding-bottom: 16px; text-align: center;">
                <p style="margin: 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #2e2e2e;">
                  DESIGNERDRIP
                </p>
              </td>
            </tr>

            <!-- Footer legal -->
            <tr>
              <td style="text-align: center;">
                <p style="margin: 0; font-size: 11px; line-height: 1.7; color: #2e2e2e; letter-spacing: 0.04em;">
                  © ${new Date().getFullYear()} Designerdrip · All rights reserved<br/>
                  Questions? <a href="mailto:support@designerdrip.store" style="color: #444240; text-decoration: none;">support@designerdrip.store</a>
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

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Designerdrip <welcome@designerdrip.store>",
        to: customerEmail,
        subject: "You now have access – Designerdrip",
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error("[access-granted-email] Resend error:", err)
      return false
    }

    return true
  } catch (err) {
    console.error("[access-granted-email] Exception:", err)
    return false
  }
}
