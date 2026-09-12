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

    const orderItemsHtml = orderItems
      .map(
        (item) => `
          <tr>
            <td style="padding: 14px 12px; border-bottom: 1px solid #eeeeee;">
              <strong style="font-weight: 600; color: #111111;">
                ${item.products?.name || "Product"}
              </strong>
              ${
                item.product_variants?.size
                  ? `<br><span style="color: #888888; font-size: 12px;">Size: ${item.product_variants.size}</span>`
                  : ""
              }
              ${
                item.product_variants?.color
                  ? `<br><span style="color: #888888; font-size: 12px;">Color: ${item.product_variants.color}</span>`
                  : ""
              }
            </td>

            <td
              align="center"
              style="
                padding: 14px 8px;
                border-bottom: 1px solid #eeeeee;
                text-align: center;
                color: #555555;
              "
            >
              ${item.quantity}
            </td>

            <td
              align="right"
              style="
                padding: 14px 12px;
                border-bottom: 1px solid #eeeeee;
                text-align: right;
                color: #111111;
                font-weight: 500;
              "
            >
              EUR ${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        `,
      )
      .join("")

    const orderIdShort = order.id.slice(0, 8).toUpperCase()

    const orderDate = new Date(order.created_at).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    )

    const emailHtml = `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Received • #${orderIdShort}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
      color: #111111;
    }

    table {
      border-spacing: 0;
    }

    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }

      .email-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }

      .hero-title {
        font-size: 25px !important;
      }

      .order-table {
        font-size: 12px !important;
      }
    }
  </style>
</head>

<body>

  <table
    role="presentation"
    width="100%"
    border="0"
    cellspacing="0"
    cellpadding="0"
    style="background-color:#f5f5f5;"
  >
    <tr>
      <td
        align="center"
        style="padding: 32px 16px;"
      >

        <!-- Main Container -->
        <table
          role="presentation"
          class="email-container"
          width="100%"
          border="0"
          cellspacing="0"
          cellpadding="0"
          style="
            max-width: 580px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
          "
        >

          <!-- Brand Header -->
          <tr>
            <td
              class="email-padding"
              style="
                padding: 26px 30px 22px;
                border-bottom: 1px solid #eeeeee;
              "
            >
              <div
                style="
                  font-size: 12px;
                  letter-spacing: 0.18em;
                  font-weight: 700;
                  color: #111111;
                "
              >
                SAINT YVE
              </div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td
              class="email-padding"
              style="
                padding: 38px 30px 24px;
              "
            >

              <div
                style="
                  font-size: 10px;
                  letter-spacing: 0.18em;
                  text-transform: uppercase;
                  color: #999999;
                  margin-bottom: 12px;
                "
              >
                Payment received
              </div>

              <h1
                class="hero-title"
                style="
                  margin: 0 0 10px;
                  font-size: 28px;
                  line-height: 1.2;
                  font-weight: 600;
                  letter-spacing: -0.02em;
                  color: #111111;
                "
              >
                Your order is now processing.
              </h1>

              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #888888;
                "
              >
                Order #${orderIdShort}
              </p>

            </td>
          </tr>

          <!-- Payment Confirmation -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 28px;"
            >

              <table
                role="presentation"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="
                  background-color: #fafafa;
                  border: 1px solid #eeeeee;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="padding: 18px;">

                    <div
                      style="
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: #999999;
                        margin-bottom: 7px;
                      "
                    >
                      Payment status
                    </div>

                    <div
                      style="
                        font-size: 15px;
                        font-weight: 600;
                        color: #111111;
                        margin-bottom: 6px;
                      "
                    >
                      Payment received
                    </div>

                    <div
                      style="
                        font-size: 12px;
                        line-height: 1.6;
                        color: #777777;
                      "
                    >
                      Your payment has been successfully received.
                      Your order is now being processed by our team.
                    </div>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 30px;"
            >

              <p
                style="
                  margin: 0 0 12px;
                  font-size: 14px;
                  line-height: 1.7;
                  color: #222222;
                "
              >
                Everything is now in place. Our team will carefully
                review and prepare your order before it is dispatched.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.7;
                  color: #777777;
                "
              >
                Once your order has been dispatched, you'll receive
                a separate shipping confirmation with your tracking
                information.
              </p>

            </td>
          </tr>

          <!-- Order Progress -->
          <tr>
            <td
              class="email-padding"
              style="
                padding: 0 30px 30px;
              "
            >

              <table
                role="presentation"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="
                  border-top: 1px solid #eeeeee;
                  border-bottom: 1px solid #eeeeee;
                "
              >

                <tr>
                  <td style="padding: 22px 0 20px;">

                    <h2
                      style="
                        margin: 0 0 16px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #111111;
                      "
                    >
                      Order progress
                    </h2>

                    <table
                      role="presentation"
                      width="100%"
                      border="0"
                      cellspacing="0"
                      cellpadding="0"
                    >

                      <!-- Step 1 -->
                      <tr>
                        <td
                          valign="top"
                          style="
                            width: 28px;
                            padding-bottom: 13px;
                            color: #999999;
                            font-size: 12px;
                            font-weight: 600;
                          "
                        >
                          01
                        </td>

                        <td
                          style="
                            padding-bottom: 13px;
                            font-size: 12px;
                            line-height: 1.5;
                            color: #555555;
                          "
                        >
                          <strong style="color:#222222;">
                            Order received
                          </strong>
                          <br />
                          Your order has been successfully placed.
                        </td>
                      </tr>

                      <!-- Step 2 -->
                      <tr>
                        <td
                          valign="top"
                          style="
                            width: 28px;
                            padding-bottom: 13px;
                            color: #111111;
                            font-size: 12px;
                            font-weight: 700;
                          "
                        >
                          02
                        </td>

                        <td
                          style="
                            padding-bottom: 13px;
                            font-size: 12px;
                            line-height: 1.5;
                            color: #555555;
                          "
                        >
                          <strong style="color:#111111;">
                            Payment received
                          </strong>
                          <br />
                          Your payment has been confirmed.
                        </td>
                      </tr>

                      <!-- Step 3 -->
                      <tr>
                        <td
                          valign="top"
                          style="
                            width: 28px;
                            padding-bottom: 13px;
                            color: #111111;
                            font-size: 12px;
                            font-weight: 700;
                          "
                        >
                          03
                        </td>

                        <td
                          style="
                            padding-bottom: 13px;
                            font-size: 12px;
                            line-height: 1.5;
                            color: #555555;
                          "
                        >
                          <strong style="color:#111111;">
                            Order processing
                          </strong>
                          <br />
                          Our team is preparing your order.
                        </td>
                      </tr>

                      <!-- Step 4 -->
                      <tr>
                        <td
                          valign="top"
                          style="
                            width: 28px;
                            color: #999999;
                            font-size: 12px;
                            font-weight: 600;
                          "
                        >
                          04
                        </td>

                        <td
                          style="
                            font-size: 12px;
                            line-height: 1.5;
                            color: #555555;
                          "
                        >
                          <strong style="color:#222222;">
                            Dispatched
                          </strong>
                          <br />
                          Tracking information will follow once shipped.
                        </td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 18px;"
            >

              <h2
                style="
                  margin: 0 0 14px;
                  font-size: 14px;
                  font-weight: 600;
                  color: #111111;
                "
              >
                Order summary
              </h2>

              <table
                role="presentation"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="
                  border-collapse: collapse;
                  font-size: 12px;
                "
              >

                <tr>
                  <td style="padding: 5px 0; color: #888888;">
                    Order date
                  </td>

                  <td
                    style="
                      padding: 5px 0;
                      text-align: right;
                      color: #222222;
                      font-weight: 500;
                    "
                  >
                    ${orderDate}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 5px 0; color: #888888;">
                    Order number
                  </td>

                  <td
                    style="
                      padding: 5px 0;
                      text-align: right;
                      color: #222222;
                      font-weight: 500;
                    "
                  >
                    #${orderIdShort}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 5px 0; color: #888888;">
                    Payment
                  </td>

                  <td
                    style="
                      padding: 5px 0;
                      text-align: right;
                      color: #222222;
                      font-weight: 500;
                    "
                  >
                    Received
                  </td>
                </tr>

                <tr>
                  <td style="padding: 5px 0; color: #888888;">
                    Status
                  </td>

                  <td
                    style="
                      padding: 5px 0;
                      text-align: right;
                      color: #222222;
                      font-weight: 500;
                    "
                  >
                    Processing
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 24px;"
            >

              <table
                role="presentation"
                class="order-table"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="
                  border-collapse: collapse;
                  border: 1px solid #eeeeee;
                  border-radius: 8px;
                  overflow: hidden;
                  font-size: 12px;
                "
              >

                <thead>
                  <tr style="background-color:#fafafa;">

                    <th
                      align="left"
                      style="
                        padding: 11px 12px;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        font-weight: 600;
                        color: #888888;
                        border-bottom: 1px solid #eeeeee;
                      "
                    >
                      Product
                    </th>

                    <th
                      align="center"
                      style="
                        padding: 11px 8px;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        font-weight: 600;
                        color: #888888;
                        border-bottom: 1px solid #eeeeee;
                      "
                    >
                      Qty
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 11px 12px;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        font-weight: 600;
                        color: #888888;
                        border-bottom: 1px solid #eeeeee;
                      "
                    >
                      Price
                    </th>

                  </tr>
                </thead>

                <tbody>
                  ${orderItemsHtml}
                </tbody>

              </table>

            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 28px;"
            >

              <table
                role="presentation"
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="
                  border-collapse: collapse;
                  font-size: 12px;
                "
              >

                <tr>
                  <td style="padding: 6px 0; color:#888888;">
                    Subtotal
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align:right;
                      color:#222222;
                    "
                  >
                    EUR ${order.subtotal_amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>

                ${
                  order.discount_amount
                    ? `
                <tr>
                  <td style="padding: 6px 0; color:#888888;">
                    Discount
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align:right;
                      color:#222222;
                    "
                  >
                    -EUR ${order.discount_amount.toFixed(2)}
                  </td>
                </tr>
                `
                    : ""
                }

                <tr>
                  <td style="padding: 6px 0; color:#888888;">
                    Shipping
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align:right;
                      color:#222222;
                    "
                  >
                    EUR ${order.shipping_amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 6px 0; color:#888888;">
                    Tax
                  </td>

                  <td
                    style="
                      padding: 6px 0;
                      text-align:right;
                      color:#222222;
                    "
                  >
                    EUR ${order.tax_amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 14px 0 4px;
                      border-top: 1px solid #eeeeee;
                      font-size: 14px;
                      font-weight: 600;
                      color:#111111;
                    "
                  >
                    Total
                  </td>

                  <td
                    style="
                      padding: 14px 0 4px;
                      border-top: 1px solid #eeeeee;
                      text-align:right;
                      font-size: 14px;
                      font-weight: 600;
                      color:#111111;
                    "
                  >
                    EUR ${order.total_amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          ${
            order.shipping_address
              ? `
          <!-- Shipping Address -->
          <tr>
            <td
              class="email-padding"
              style="padding: 0 30px 30px;"
            >

              <h2
                style="
                  margin: 0 0 12px;
                  font-size: 14px;
                  font-weight: 600;
                  color: #111111;
                "
              >
                Shipping address
              </h2>

              <div
                style="
                  padding: 14px;
                  background-color: #fafafa;
                  border: 1px solid #eeeeee;
                  border-radius: 8px;
                  font-size: 12px;
                  line-height: 1.7;
                  color: #555555;
                "
              >
                ${order.shipping_address.fullName || ""}<br />
                ${order.shipping_address.address || ""}<br />

                ${
                  order.shipping_address.apartment
                    ? `${order.shipping_address.apartment}<br />`
                    : ""
                }

                ${order.shipping_address.city || ""},
                ${order.shipping_address.postalCode || ""}<br />

                ${order.shipping_address.country || ""}

                ${
                  order.shipping_address.phone
                    ? `<br />${order.shipping_address.phone}`
                    : ""
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
              class="email-padding"
              style="
                padding: 24px 30px 28px;
                border-top: 1px solid #eeeeee;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0 0 8px;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #777777;
                "
              >
                Questions about your order?
                <a
                  href="mailto:support@designerdrip.store"
                  style="
                    color:#333333;
                    text-decoration:underline;
                  "
                >
                  support@designerdrip.store
                </a>
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 10px;
                  line-height: 1.5;
                  color: #aaaaaa;
                "
              >
                © ${new Date().getFullYear()} SAINT YVE.
                All rights reserved.
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
        from: "SAINT YVE <orders@designerdrip.store>",
        to: order.customer_email,
        subject: `Payment Received • Order #${orderIdShort}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Resend API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] Processing email sent successfully:", result)

    return true
  } catch (error) {
    console.error("[v0] Error sending processing email:", error)
    return false
  }
}