// Formats a numeric amount as "EUR 1,200.00" — thousands separators, always
// two decimals — matching the Cart Drawer and Order Confirmation page.
function formatEUR(amount: number | null | undefined): string {
  const value = amount ?? 0
  return `EUR ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Mirrors the +14 day delivery estimate shown on the Order Confirmation page.
function getEstimatedDeliveryDate(orderDate: string): string {
  const date = new Date(orderDate)
  date.setDate(date.getDate() + 14)
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export async function sendOrderProcessingEmail({
  order,
  orderItems,
}: {
  order: any
  orderItems: any[]
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return false
    }

    const orderIdShort = order.id.slice(0, 8).toUpperCase()

    const orderItemsHtml = orderItems
      .map((item) => {
        const productName = item.products?.name || "Product"
        const brand = productName.split(" ")[0]
        const model = productName.split(" ").slice(1).join(" ") || productName
        const color = item.product_variants?.color
        const size = item.product_variants?.size
        const quantity = String(item.quantity).padStart(2, "0")
        const image = item.resolvedImage

        return `
          <tr>
            <td style="padding: 26px 0; border-bottom: 1px solid #ececec;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="84" valign="top" style="padding-right: 20px;">
                    ${
                      image
                        ? `<img src="${image}" width="84" height="84" alt="${productName}" style="display:block; width:84px; height:84px; object-fit:contain; background-color:#fafafa; border:1px solid #f0f0f0;" />`
                        : `<div style="width:84px; height:84px; background-color:#fafafa; border:1px solid #f0f0f0;"></div>`
                    }
                  </td>
                  <td valign="top">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="top">
                          <div style="font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0 0 7px;">
                            ${brand}
                          </div>
                          <div style="font-size:15px; font-weight:500; color:#111111; line-height:1.4; margin:0 0 6px;">
                            ${model}
                          </div>
                          ${color ? `<div style="font-size:12px; color:#888888; margin:0 0 2px;">${color}</div>` : ""}
                          ${size ? `<div style="font-size:12px; color:#888888; margin:0 0 2px;">Size ${size}</div>` : ""}
                          <div style="font-size:11px; letter-spacing:0.1em; color:#aaaaaa; margin-top:10px;">
                            Quantity ${quantity}
                          </div>
                        </td>
                        <td valign="top" align="right" style="white-space:nowrap; padding-left:14px;">
                          <span style="font-size:13px; font-weight:500; color:#111111;">
                            ${formatEUR(item.price * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `
      })
      .join("")

    const addressName = order.shipping_address?.fullName || order.customer_name || ""

    const emailHtml = `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Order Confirmed • #${orderIdShort}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Helvetica,
        Arial,
        sans-serif;
      color: #111111;
    }

    table {
      border-spacing: 0;
    }

    @media only screen and (max-width: 600px) {
      .email-padding {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      .order-number {
        font-size: 21px !important;
      }
    }
  </style>
</head>

<body style="background-color:#ffffff;">

  <table
    role="presentation"
    width="100%"
    border="0"
    cellspacing="0"
    cellpadding="0"
    style="background-color:#ffffff;"
  >
    <tr>
      <td align="center" style="padding: 0;">

        <!-- Main Container -->
        <table
          role="presentation"
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          style="max-width: 560px; width: 100%; background-color: #ffffff;"
        >

          <!-- Masthead -->
          <tr>
            <td class="email-padding" style="padding: 44px 40px 26px; text-align:center;">
              <div style="font-size:12px; letter-spacing:0.24em; font-weight:600; color:#111111;">
                SAINT YVE
              </div>
              <div style="font-size:10px; letter-spacing:0.3em; color:#aaaaaa; margin-top:5px;">
                BERLIN
              </div>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #ececec;"></td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td class="email-padding" style="padding: 48px 40px 40px; text-align:center;">

              <div
                style="
                  width: 22px;
                  height: 22px;
                  line-height: 22px;
                  margin: 0 auto 22px;
                  border: 1px solid #111111;
                  font-size: 11px;
                  color: #111111;
                "
              >
                &#10003;
              </div>

              <div style="font-size:10px; letter-spacing:0.26em; text-transform:uppercase; color:#999999; margin:0 0 16px;">
                Order Confirmed
              </div>

              <div class="order-number" style="font-size:24px; font-weight:500; letter-spacing:0.04em; color:#111111; margin:0 0 18px;">
                #${orderIdShort}
              </div>

              <div style="font-size:13px; line-height:1.7; color:#888888; max-width:360px; margin:0 auto;">
                Your order has been confirmed. A confirmation with your order
                details has been sent to
                <span style="color:#111111;">${order.customer_email || ""}</span>.
              </div>

            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #ececec;"></td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td class="email-padding" style="padding: 44px 40px 0;">
              <div style="font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0 0 8px;">
                Order Summary
              </div>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td class="email-padding" style="padding: 0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                ${orderItemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td class="email-padding" style="padding: 22px 40px 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;">

                <tr>
                  <td style="padding: 6px 0; color:#999999; letter-spacing:0.05em; text-transform:uppercase; font-size:11px;">
                    Subtotal
                  </td>
                  <td style="padding: 6px 0; text-align:right; color:#111111;">
                    ${formatEUR(order.subtotal_amount)}
                  </td>
                </tr>

                ${
                  order.discount_amount
                    ? `
                <tr>
                  <td style="padding: 6px 0; color:#999999; letter-spacing:0.05em; text-transform:uppercase; font-size:11px;">
                    Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}
                  </td>
                  <td style="padding: 6px 0; text-align:right; color:#111111;">
                    &minus;${formatEUR(order.discount_amount)}
                  </td>
                </tr>
                `
                    : ""
                }

                <tr>
                  <td style="padding: 6px 0; color:#999999; letter-spacing:0.05em; text-transform:uppercase; font-size:11px;">
                    Shipping
                  </td>
                  <td style="padding: 6px 0; text-align:right; color:#111111; letter-spacing:0.05em; text-transform:uppercase; font-size:11px;">
                    Free
                  </td>
                </tr>

                <tr>
                  <td style="padding: 16px 0 4px; border-top: 1px solid #ececec; font-size:12px; font-weight:600; color:#111111; letter-spacing:0.05em; text-transform:uppercase;">
                    Total
                  </td>
                  <td style="padding: 16px 0 4px; border-top: 1px solid #ececec; text-align:right; font-size:15px; font-weight:600; color:#111111;">
                    ${formatEUR(order.total_amount)}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td class="email-padding" style="padding: 40px 40px 0;">
              <div style="border-top: 1px solid #ececec;"></div>
            </td>
          </tr>

          ${
            order.shipping_address
              ? `
          <!-- Shipping Address -->
          <tr>
            <td class="email-padding" style="padding: 36px 40px 0;">
              <div style="font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0 0 14px;">
                Shipping Address
              </div>
              <div style="font-size:13px; line-height:1.7;">
                <div style="color:#111111; font-weight:500; margin:0 0 2px;">${addressName}</div>
                <div style="color:#888888;">${order.shipping_address.address || ""}</div>
                ${order.shipping_address.apartment ? `<div style="color:#888888;">${order.shipping_address.apartment}</div>` : ""}
                <div style="color:#888888;">
                  ${order.shipping_address.city || ""}${order.shipping_address.city && order.shipping_address.postalCode ? ", " : ""}${order.shipping_address.postalCode || ""}
                </div>
                <div style="color:#888888;">${order.shipping_address.country || ""}</div>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Estimated Delivery -->
          <tr>
            <td class="email-padding" style="padding: 32px 40px 0;">
              <div style="font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0 0 10px;">
                Estimated Delivery
              </div>
              <div style="font-size:16px; font-weight:500; color:#111111; margin:0 0 6px;">
                ${getEstimatedDeliveryDate(order.created_at)}
              </div>
              <div style="font-size:12px; line-height:1.6; color:#999999;">
                Your order will be shipped within 1&ndash;2 business days.
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-padding" style="padding: 40px 40px 0;">
              <div style="border-top: 1px solid #ececec;"></div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td class="email-padding" style="padding: 36px 40px 44px; text-align:center;">
              <div style="font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0 0 10px;">
                Need Assistance?
              </div>
              <a
                href="mailto:support@designerdrip.store"
                style="font-size:13px; color:#111111; text-decoration:underline;"
              >
                support@designerdrip.store
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #ececec;"></td>
          </tr>
          <tr>
            <td class="email-padding" style="padding: 26px 40px 40px; text-align:center;">
              <div style="font-size:10px; letter-spacing:0.2em; color:#bbbbbb;">
                SAINT YVE &middot; BERLIN
              </div>
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
        from: "SAINT YVE <orders@designerdrip.store>",
        to: order.customer_email,
        subject: `Order Confirmed \u2014 #${orderIdShort}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] Confirmation email sent successfully:", result)

    return true
  } catch (error) {
    console.error("[v0] Error sending confirmation email:", error)
    return false
  }
}
