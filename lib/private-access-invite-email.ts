export async function sendPrivateAccessInviteEmail({
  email,
  registrationUrl,
}: {
  email: string
  registrationUrl: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[invite] RESEND_API_KEY not configured")
    return false
  }

  const year = new Date().getFullYear()

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You have been granted access to Saint Yve</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
          style="max-width:520px;width:100%;border-collapse:collapse;background-color:#111111;border:1px solid #222222;">

          <!-- Top accent line -->
          <tr>
            <td style="height:1px;background-color:#2a2a2a;line-height:1px;font-size:1px;">&nbsp;</td>
          </tr>

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding:40px 40px 0;">
              <p style="margin:0;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#444444;font-weight:500;">
                SAINT YVE
              </p>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h1 style="margin:0;font-size:26px;font-weight:300;letter-spacing:0.02em;color:#f5f5f5;line-height:1.3;">
                You&rsquo;ve been granted<br/>private access.
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="height:1px;background-color:#1e1e1e;">&nbsp;</div>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.75;color:#888888;font-weight:300;">
                Your application has been reviewed and approved. You now have access to Saint Yve &mdash; our curated platform for premium and authenticated designer pieces.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.75;color:#888888;font-weight:300;">
                To activate your account, complete your registration below. This link is unique to you and can only be used once.
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:36px 40px 0;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="background-color:#f5f5f5;">
                    <a href="${registrationUrl}"
                      style="display:inline-block;padding:14px 36px;font-size:11px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#111111;text-decoration:none;white-space:nowrap;">
                      Create Your Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding:16px 40px 0;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#333333;">
                Or copy this link into your browser:<br/>
                <a href="${registrationUrl}" style="color:#555555;text-decoration:underline;word-break:break-all;">
                  ${registrationUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:36px 40px 0;">
              <div style="height:1px;background-color:#1e1e1e;">&nbsp;</div>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0;font-size:12px;line-height:1.7;color:#3a3a3a;">
                This invitation is valid for <strong style="color:#4a4a4a;font-weight:500;">7 days</strong> and is tied exclusively to this email address. If you did not apply for access, you may disregard this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 40px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#2a2a2a;font-weight:500;">
                SAINT YVE
              </p>
              <p style="margin:0;font-size:11px;color:#2a2a2a;">
                &copy; ${year} Saint Yve. All rights reserved.
              </p>
            </td>
          </tr>

          <!-- Bottom accent line -->
          <tr>
            <td style="height:1px;background-color:#1a1a1a;line-height:1px;font-size:1px;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SAINT YVE <access@designerdrip.store>",
        to: email,
        subject: "You have been granted access to Saint Yve",
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error("[invite] Resend error:", err)
      return false
    }

    return true
  } catch (error) {
    console.error("[invite] Exception sending invite email:", error)
    return false
  }
}
