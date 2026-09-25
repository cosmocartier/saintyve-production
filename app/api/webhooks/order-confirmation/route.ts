import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { sendOrderConfirmationEmail } from "./email-sender"

// Webhook secret for validation (set this in your environment variables)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret-key"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const maxDuration = 60
export const dynamic = "force-dynamic"

async function logWebhook(
  supabase: any,
  {
    eventType,
    tableName,
    recordId,
    payload,
    status,
    errorMessage,
  }: {
    eventType: string
    tableName: string
    recordId: string
    payload: any
    status: "pending" | "success" | "failed" | "retrying"
    errorMessage?: string
  },
) {
  try {
    const { error } = await supabase.from("webhook_logs").insert({
      event_type: eventType,
      table_name: tableName,
      record_id: recordId,
      payload: payload,
      status: status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Failed to insert webhook log:", error)
    } else {
      console.log("[v0] Webhook log created successfully:", { recordId, status })
    }
  } catch (error) {
    console.error("[v0] Exception while logging webhook:", error)
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Order confirmation webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("[v0] ===== ORDER CONFIRMATION WEBHOOK TRIGGERED =====")
  console.log("[v0] Timestamp:", new Date().toISOString())

  let payload: any
  let orderId: string | null = null

  try {
    // Parse request body
    const bodyText = await request.text()
    console.log("[v0] Raw request body received")

    try {
      payload = JSON.parse(bodyText)
      orderId = payload.record?.id || null
      console.log("[v0] Parsed payload:", {
        type: payload.type,
        table: payload.table,
        orderId,
      })
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature")
    if (signature !== WEBHOOK_SECRET) {
      console.error("[v0] Invalid webhook signature")
      if (orderId) {
        await logWebhook(supabase, {
          eventType: payload.type,
          tableName: payload.table,
          recordId: orderId,
          payload,
          status: "failed",
          errorMessage: "Invalid webhook signature",
        })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only process INSERT events for new orders
    if (payload.type !== "INSERT" || payload.table !== "orders") {
      console.log("[v0] Skipping non-order INSERT event")
      return NextResponse.json({ success: true, message: "Event skipped" })
    }

    if (!orderId) {
      console.error("[v0] No order ID in payload")
      return NextResponse.json({ error: "No order ID found" }, { status: 400 })
    }

    // Log webhook received
    await logWebhook(supabase, {
      eventType: payload.type,
      tableName: payload.table,
      recordId: orderId,
      payload,
      status: "pending",
    })

    console.log("[v0] Fetching order details for:", orderId)

    // Fetch order with retries
    let order = null
    let fetchAttempts = 0
    const maxFetchAttempts = 3

    while (!order && fetchAttempts < maxFetchAttempts) {
      fetchAttempts++
      console.log("[v0] Fetch attempt", fetchAttempts, "of", maxFetchAttempts)

      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (error) {
        console.error("[v0] Error fetching order (attempt", fetchAttempts, "):", error)
        if (fetchAttempts < maxFetchAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * fetchAttempts))
        }
      } else {
        order = data
        console.log("[v0] Order fetched successfully:", {
          id: order.id,
          email: order.customer_email,
          total: order.total,
        })
      }
    }

    if (!order) {
      const errorMsg = `Failed to fetch order after ${maxFetchAttempts} attempts`
      console.error("[v0]", errorMsg)
      await logWebhook(supabase, {
        eventType: payload.type,
        tableName: payload.table,
        recordId: orderId,
        payload,
        status: "failed",
        errorMessage: errorMsg,
      })
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    // This webhook fires on every INSERT into "orders", which happens the moment the
    // customer clicks Pay — long before Mollie confirms anything. Creating the order is
    // NOT the same as completing it, so this must never notify the customer at that point.
    // Mollie's own webhook (/api/webhooks/mollie) is the sole trigger for the paid
    // confirmation email; this handler only proceeds if the order somehow already
    // reached a paid state and has not been confirmed yet (defensive idempotency).
    const isPaidOrBeyond = ["completed", "paid", "processing", "shipped", "fulfilled", "delivered"].includes(
      order.status,
    )

    if (!isPaidOrBeyond) {
      console.log("[v0] Order confirmation webhook skipped — order not paid yet:", order.id, order.status)
      await logWebhook(supabase, {
        eventType: payload.type,
        tableName: payload.table,
        recordId: orderId,
        payload,
        status: "success",
        errorMessage: "Skipped — order not paid yet",
      })
      return NextResponse.json({ success: true, skipped: true, reason: "Order not paid yet" })
    }

    if (order.confirmation_email_sent_at) {
      console.log("[v0] Order confirmation webhook skipped — confirmation already sent:", order.id)
      await logWebhook(supabase, {
        eventType: payload.type,
        tableName: payload.table,
        recordId: orderId,
        payload,
        status: "success",
        errorMessage: "Skipped — confirmation already sent",
      })
      return NextResponse.json({ success: true, skipped: true, reason: "Confirmation already sent" })
    }

    // Fetch order items with retries
    console.log("[v0] Fetching order items for order:", orderId)
    let orderItems = []
    let itemsFetchAttempts = 0

    while (orderItems.length === 0 && itemsFetchAttempts < maxFetchAttempts) {
      itemsFetchAttempts++
      console.log("[v0] Items fetch attempt", itemsFetchAttempts, "of", maxFetchAttempts)

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products!order_items_product_id_fkey (id, name, slug, image_folder),
          product_variants!order_items_variant_id_fkey (id, size, color, sku)
        `,
        )
        .eq("order_id", orderId)

      if (error) {
        console.error("[v0] Error fetching order items (attempt", itemsFetchAttempts, "):", error)
        if (itemsFetchAttempts < maxFetchAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * itemsFetchAttempts))
        }
      } else {
        orderItems = data || []
        console.log("[v0] Order items fetched:", orderItems.length, "items")
      }
    }

    if (orderItems.length === 0) {
      const errorMsg = `No order items found after ${maxFetchAttempts} attempts`
      console.error("[v0]", errorMsg)
      await logWebhook(supabase, {
        eventType: payload.type,
        tableName: payload.table,
        recordId: orderId,
        payload,
        status: "failed",
        errorMessage: errorMsg,
      })
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    // Send email with retries
    console.log("[v0] Attempting to send confirmation email to:", order.customer_email)
    let emailSent = false
    let emailAttempts = 0
    const maxEmailAttempts = 3
    let lastEmailError = ""

    while (!emailSent && emailAttempts < maxEmailAttempts) {
      emailAttempts++
      console.log("[v0] Email send attempt", emailAttempts, "of", maxEmailAttempts)

      try {
        emailSent = await sendOrderConfirmationEmail({ order, orderItems })
        if (emailSent) {
          console.log("[v0] Email sent successfully on attempt", emailAttempts)
        } else {
          lastEmailError = `Email send returned false on attempt ${emailAttempts}`
          console.error("[v0]", lastEmailError)
          if (emailAttempts < maxEmailAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000 * emailAttempts))
          }
        }
      } catch (error) {
        lastEmailError = `Email send threw error on attempt ${emailAttempts}: ${error instanceof Error ? error.message : String(error)}`
        console.error("[v0]", lastEmailError)
        if (emailAttempts < maxEmailAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * emailAttempts))
        }
      }
    }

    if (!emailSent) {
      console.error("[v0] CRITICAL: Failed to send email after", maxEmailAttempts, "attempts")
      await logWebhook(supabase, {
        eventType: payload.type,
        tableName: payload.table,
        recordId: orderId,
        payload,
        status: "failed",
        errorMessage: `Failed to send email after ${maxEmailAttempts} attempts. Last error: ${lastEmailError}`,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send confirmation email",
          details: lastEmailError,
        },
        { status: 500 },
      )
    }

    // Mark confirmation as sent so duplicate deliveries never re-send the email.
    await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId)

    // Success - log it
    await logWebhook(supabase, {
      eventType: payload.type,
      tableName: payload.table,
      recordId: orderId,
      payload,
      status: "success",
    })

    console.log("[v0] ===== WEBHOOK COMPLETED SUCCESSFULLY =====")
    return NextResponse.json({
      success: true,
      orderId,
      emailSent: true,
      attempts: emailAttempts,
    })
  } catch (error) {
    console.error("[v0] ===== WEBHOOK ERROR =====")
    console.error("[v0] Error:", error)
    console.error("[v0] Stack:", error instanceof Error ? error.stack : "No stack trace")

    if (orderId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await logWebhook(supabase, {
        eventType: payload?.type || "unknown",
        tableName: payload?.table || "unknown",
        recordId: orderId,
        payload: payload || {},
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function generateInvoicePDF(order: any, orderItems: any[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let yPosition = height - 60

  // TOP HEADER - Left: Logo, Right: Company Details
  // Left: Saint Yve Logo (matte black, 36px)
  page.drawText("SAINT YVE", {
    x: 50,
    y: yPosition,
    size: 36,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  // Right: Company Details (right-aligned)
  const companyDetails = [
    "SAINT YVE",
    "Premium Resale & Authentication Studio",
    "Dubai · Germany · Worldwide Shipping",
    "support@designerdrip.com",
  ]

  let detailY = yPosition
  for (const detail of companyDetails) {
    const textWidth = detail.length * (detail === companyDetails[0] ? 5 : 3.8)
    page.drawText(detail, {
      x: width - 50 - textWidth,
      y: detailY,
      size: detail === companyDetails[0] ? 10 : 8,
      font: detail === companyDetails[0] ? boldFont : regularFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    detailY -= 14
  }

  yPosition -= 60

  // Divider line (#EAEAEA, 1px)
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0.92, 0.92, 0.92),
  })

  yPosition -= 40

  // INVOICE TITLE SECTION
  // Left: INVOICE and invoice number
  page.drawText("INVOICE", {
    x: 50,
    y: yPosition,
    size: 22,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  const invoiceNum = `#DD-2025-${order.id.slice(0, 6).toUpperCase()}`
  page.drawText(invoiceNum, {
    x: 50,
    y: yPosition - 20,
    size: 13,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Right: Date, Due, Order No, Customer ID
  const orderDate = new Date(order.created_at).toLocaleDateString("en-GB").replace(/\//g, ".")
  const dueDate = new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-GB")
    .replace(/\//g, ".")

  const invoiceDetails = [
    `Date: ${orderDate}`,
    `Due: ${dueDate}`,
    `Order No: ${order.id.slice(0, 8).toUpperCase()}`,
    `Customer ID: C${order.id.slice(-7).toUpperCase()}`,
  ]

  let invoiceDetailY = yPosition
  for (const detail of invoiceDetails) {
    const textWidth = detail.length * 4.2
    page.drawText(detail, {
      x: width - 50 - textWidth,
      y: invoiceDetailY,
      size: 13,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    invoiceDetailY -= 18
  }

  yPosition -= 90

  // SHIPPING BLOCK - Clean gray box
  const boxX = 50
  const boxY = yPosition - 130
  const boxWidth = width - 100
  const boxHeight = 120

  // Background box (#FAFAFA with #EFEFEF border)
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.94, 0.94, 0.94),
    borderWidth: 1,
  })

  // SHIPPING TO label (ALL CAPS)
  page.drawText("SHIPPING TO", {
    x: boxX + 20,
    y: boxY + boxHeight - 25,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  // Customer shipping details
  let shippingY = boxY + boxHeight - 48
  const shippingAddress = order.shipping_address || {}

  const shippingLines = [
    `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim(),
    shippingAddress.address || "",
    `${shippingAddress.postalCode || ""} ${shippingAddress.city || ""}`.trim(),
    shippingAddress.country || "",
  ].filter((line) => line)

  for (const line of shippingLines) {
    page.drawText(line, {
      x: boxX + 20,
      y: shippingY,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    })
    shippingY -= 16
  }

  yPosition = boxY - 40

  // LINE ITEMS TABLE
  page.drawText("ITEM", {
    x: 50,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("DETAILS", {
    x: 200,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("QTY", {
    x: 380,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("UNIT PRICE", {
    x: 440,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("TOTAL", {
    x: 525,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPosition -= 5

  // Header divider
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0.94, 0.94, 0.94),
  })

  yPosition -= 20

  // Order items
  for (const item of orderItems) {
    const itemName = item.products?.name || "Product"
    const size = item.product_variants?.size || ""
    const color = item.product_variants?.color || ""

    // Product name (truncated if needed)
    const truncatedName = itemName.length > 25 ? itemName.substring(0, 25) + "..." : itemName
    page.drawText(truncatedName, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    // Details: Color & Size
    const details = [color, size].filter((d) => d).join(" · ")
    page.drawText(details, {
      x: 200,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Quantity
    page.drawText(item.quantity.toString(), {
      x: 390,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    // Unit Price
    page.drawText(`€${item.price.toFixed(2)}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    // Total
    page.drawText(`€${(item.price * item.quantity).toFixed(2)}`, {
      x: 525,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18

    // Row divider
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 0.5,
      color: rgb(0.94, 0.94, 0.94),
    })

    yPosition -= 8
  }

  yPosition -= 20

  // TOTAL SUMMARY (right-aligned)
  const summaryX = 420

  // Subtotal
  page.drawText("Subtotal:", {
    x: summaryX,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText(`€${order.subtotal_amount?.toFixed(2) || "0.00"}`, {
    x: 525,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0, 0, 0),
  })
  yPosition -= 18

  // Shipping
  page.drawText("Shipping:", {
    x: summaryX,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText(`€${order.shipping_amount?.toFixed(2) || "0.00"}`, {
    x: 525,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0, 0, 0),
  })
  yPosition -= 25

  // Total divider
  page.drawLine({
    start: { x: summaryX, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  })
  yPosition -= 20

  // Total
  page.drawText("Total:", {
    x: summaryX,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  page.drawText(`€${order.total_amount?.toFixed(2) || "0.00"}`, {
    x: 515,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= 60

  // AUTHENTICITY GUARANTEE BLOCK
  const guaranteeBoxY = 150
  const guaranteeBoxHeight = 60

  page.drawRectangle({
    x: 50,
    y: guaranteeBoxY,
    width: width - 100,
    height: guaranteeBoxHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.94, 0.94, 0.94),
    borderWidth: 1,
  })

  page.drawText("AUTHENTICITY GUARANTEE", {
    x: 70,
    y: guaranteeBoxY + 40,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  const guaranteeText = "All products sold by Saint Yve undergo multi-stage authentication"
  const guaranteeText2 = "and quality verification."

  page.drawText(guaranteeText, {
    x: 70,
    y: guaranteeBoxY + 22,
    size: 9,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(guaranteeText2, {
    x: 70,
    y: guaranteeBoxY + 10,
    size: 9,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // FOOTER (centered, cinematic-minimal)
  const footerLines = [
    "Saint Yve® — Premium Resale & Authentication Studio",
    "Dubai · Germany · Worldwide Shipping",
    "www.designerdrip.com",
  ]

  let footerY = 70
  for (const line of footerLines) {
    const textWidth = line.length * (line === footerLines[0] ? 4.2 : 3.5)
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y: footerY,
      size: line === footerLines[0] ? 9 : 8,
      font: line === footerLines[0] ? boldFont : regularFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    footerY -= 14
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
