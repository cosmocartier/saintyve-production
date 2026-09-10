import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { orderIds } = await req.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch orders that are pending
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        payment_method,
        total,
        customer_email,
        customer_name,
        shipping_address,
        payment_reminder_count,
        profiles (
          email,
          full_name
        )
      `,
      )
      .in("id", orderIds)
      .eq("status", "pending")

    if (ordersError || !orders || orders.length === 0) {
      console.error("[v0] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "No pending orders found", count: 0 }, { status: 200 })
    }

    console.log(`[v0] Sending payment reminders for ${orders.length} order(s)`)

    let successCount = 0

    // Send email reminder for each order
    for (const order of orders) {
      try {
        const customerEmail = order.customer_email || order.profiles?.email || (order.shipping_address as any)?.email

        const customerName =
          order.customer_name || order.profiles?.full_name || (order.shipping_address as any)?.fullName || "Customer"

        if (!customerEmail) {
          console.error(`[v0] No email found for order ${order.id}`)
          continue
        }

        await resend.emails.send({
          from: "Designerdrip <orders@designerdrip.store>",
          to: customerEmail,
          subject: "Payment Reminder - Complete Your Order",
          html: `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <!-- Card -->
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px 32px 28px 32px;">
            <!-- Brand -->
            <tr>
              <td style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#999;padding-bottom:8px;">
                DESIGNERDRIP
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="font-size:20px;line-height:1.3;color:#000;padding-top:4px;">
                Reminder: your order is still waiting for payment.
              </td>
            </tr>

            <!-- Greeting + copy -->
            <tr>
              <td style="padding-top:16px;font-size:14px;line-height:1.7;color:#333;">
                Hi ${customerName},
              </td>
            </tr>
            <tr>
              <td style="padding-top:4px;font-size:14px;line-height:1.7;color:#333;">
                you started an order on Designerdrip but we haven't received the payment yet.
                Once the payment is completed, we'll lock in your pieces and start processing your order.
              </td>
            </tr>

            <!-- Slim order line -->
            <tr>
              <td style="padding-top:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;padding:10px 0;font-size:13px;color:#555;">
                  <tr>
                    <td style="padding:4px 0;">
                      Order&nbsp;ID: <span style="color:#111;">#${order.id.slice(0, 8)}</span>
                    </td>
                    <td style="padding:4px 0;text-align:right;">
                      Total: <span style="color:#111;">${Number(order.total).toFixed(2)} EUR</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA - Updated to match confirmation email exactly -->
            <tr>
              <td style="padding-top:24px;padding-bottom:6px;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td align="center" bgcolor="#111111" style="border-radius:999px;background-color:#111111;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://designerdrip.store"}/order-confirmation/${order.id}"
                         style="display:inline-block;padding:10px 24px;font-size:14px;font-weight:500;line-height:1.4;color:#ffffff;text-decoration:none;border-radius:999px;white-space:nowrap;">
                        View payment instructions
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Secondary copy -->
            <tr>
              <td style="padding-top:12px;font-size:12px;line-height:1.6;color:#777;">
                The link takes you back to your order confirmation page with all payment details.
                If you've already sent the payment, you can simply ignore this email – we'll update your order shortly.
              </td>
            </tr>

            <!-- Support line -->
            <tr>
              <td style="padding-top:18px;font-size:12px;line-height:1.6;color:#777;">
                Questions or changes? Just reply to this email or contact
                <a href="mailto:support@designerdrip.store" style="color:#000;text-decoration:none;">
                  support@designerdrip.store
                </a>.
              </td>
            </tr>

            <!-- Footer spacing -->
            <tr>
              <td style="padding-top:24px;font-size:11px;color:#aaa;">
                © ${new Date().getFullYear()} Designerdrip. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
          `,
        })

        // Update order with reminder timestamp and count
        await supabase
          .from("orders")
          .update({
            last_payment_reminder_at: new Date().toISOString(),
            payment_reminder_count: (order.payment_reminder_count || 0) + 1,
          })
          .eq("id", order.id)

        successCount++
        console.log(`[v0] Payment reminder sent for order ${order.id}`)
      } catch (emailError) {
        console.error(`[v0] Error sending reminder for order ${order.id}:`, emailError)
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      message: `Payment reminders sent for ${successCount} order(s)`,
    })
  } catch (error) {
    console.error("[v0] Error in send-payment-reminders route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
