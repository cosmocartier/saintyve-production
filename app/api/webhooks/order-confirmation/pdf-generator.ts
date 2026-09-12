import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

export async function generateInvoicePDF(order: any, orderItems: any[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const margin = 50

  // Helper function to draw right-aligned text
  const drawRightAligned = (text: string, y: number, size: number, font: any, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: width - margin - textWidth,
      y,
      size,
      font,
      color,
    })
  }

  // Helper function to draw centered text
  const drawCentered = (text: string, y: number, size: number, font: any, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    })
  }

  let yPosition = height - 60

  // TOP HEADER - Left: Logo, Right: Company Details
  page.drawText("SAINT YVE", {
    x: margin,
    y: yPosition,
    size: 36,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  const companyDetails = [
    "SAINT YVE",
    "Premium Resale & Authentication Studio",
    "Dubai · Germany · Worldwide Shipping",
    "support@designerdrip.store",
  ]

  let detailY = yPosition
  for (const detail of companyDetails) {
    drawRightAligned(
      detail,
      detailY,
      detail === companyDetails[0] ? 10 : 8,
      detail === companyDetails[0] ? boldFont : regularFont,
      rgb(0.2, 0.2, 0.2),
    )
    detailY -= 14
  }

  yPosition -= 60

  // Divider line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.92, 0.92, 0.92),
  })

  yPosition -= 40

  // INVOICE TITLE SECTION
  page.drawText("INVOICE", {
    x: margin,
    y: yPosition,
    size: 22,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  const invoiceNum = `#DD-2025-${order.id.slice(0, 6).toUpperCase()}`
  page.drawText(invoiceNum, {
    x: margin,
    y: yPosition - 20,
    size: 13,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

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
    drawRightAligned(detail, invoiceDetailY, 13, regularFont, rgb(0.2, 0.2, 0.2))
    invoiceDetailY -= 18
  }

  yPosition -= 90

  // SHIPPING BLOCK
  const boxX = margin
  const boxY = yPosition - 130
  const boxWidth = width - margin * 2
  const boxHeight = 120

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.94, 0.94, 0.94),
    borderWidth: 1,
  })

  page.drawText("SHIPPING TO", {
    x: boxX + 20,
    y: boxY + boxHeight - 25,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

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

  const colItem = margin
  const colDetails = 180
  const colQty = 360
  const colUnitPrice = 410
  const colTotal = 500

  // LINE ITEMS TABLE
  page.drawText("ITEM", {
    x: colItem,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("DETAILS", {
    x: colDetails,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("QTY", {
    x: colQty,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("UNIT PRICE", {
    x: colUnitPrice,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText("TOTAL", {
    x: colTotal,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPosition -= 5

  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.94, 0.94, 0.94),
  })

  yPosition -= 20

  // Order items
  for (const item of orderItems) {
    const itemName = item.products?.name || "Product"
    const size = item.product_variants?.size || ""
    const color = item.product_variants?.color || ""

    const truncatedName = itemName.length > 20 ? itemName.substring(0, 20) + "..." : itemName
    page.drawText(truncatedName, {
      x: colItem,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    const details = [color, size].filter((d) => d).join(" · ")
    page.drawText(details, {
      x: colDetails,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    page.drawText(item.quantity.toString(), {
      x: colQty,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(`EUR ${item.price.toFixed(2)}`, {
      x: colUnitPrice,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(`EUR ${(item.price * item.quantity).toFixed(2)}`, {
      x: colTotal,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 0.5,
      color: rgb(0.94, 0.94, 0.94),
    })

    yPosition -= 8
  }

  yPosition -= 20

  const summaryLabelX = 390
  const summaryValueX = width - margin

  page.drawText("Subtotal:", {
    x: summaryLabelX,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  const subtotalText = `EUR ${order.subtotal_amount?.toFixed(2) || "0.00"}`
  const subtotalWidth = regularFont.widthOfTextAtSize(subtotalText, 13)
  page.drawText(subtotalText, {
    x: summaryValueX - subtotalWidth,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0, 0, 0),
  })
  yPosition -= 18

  page.drawText("Shipping:", {
    x: summaryLabelX,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  const shippingText = `EUR ${order.shipping_amount?.toFixed(2) || "0.00"}`
  const shippingWidth = regularFont.widthOfTextAtSize(shippingText, 13)
  page.drawText(shippingText, {
    x: summaryValueX - shippingWidth,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0, 0, 0),
  })
  yPosition -= 25

  page.drawLine({
    start: { x: summaryLabelX, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  })
  yPosition -= 20

  page.drawText("Total:", {
    x: summaryLabelX,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  const totalText = `EUR ${order.total_amount?.toFixed(2) || "0.00"}`
  const totalWidth = boldFont.widthOfTextAtSize(totalText, 18)
  page.drawText(totalText, {
    x: summaryValueX - totalWidth,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= 40

  const minBottomMargin = 80
  const guaranteeBoxHeight = 60

  // Ensure authenticity box doesn't go below minimum bottom margin
  if (yPosition - guaranteeBoxHeight < minBottomMargin) {
    yPosition = minBottomMargin + guaranteeBoxHeight
  }

  const guaranteeBoxY = yPosition - guaranteeBoxHeight

  page.drawRectangle({
    x: margin,
    y: guaranteeBoxY,
    width: width - margin * 2,
    height: guaranteeBoxHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.94, 0.94, 0.94),
    borderWidth: 1,
  })

  page.drawText("AUTHENTICITY GUARANTEE", {
    x: margin + 20,
    y: guaranteeBoxY + 40,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  const guaranteeText = "All products sold by Saint Yve undergo multi-stage authentication"
  const guaranteeText2 = "and quality verification."

  page.drawText(guaranteeText, {
    x: margin + 20,
    y: guaranteeBoxY + 22,
    size: 9,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(guaranteeText2, {
    x: margin + 20,
    y: guaranteeBoxY + 10,
    size: 9,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  const footerLines = [
    "Saint Yve® — Premium Resale & Authentication Studio",
    "Dubai · Germany · Worldwide Shipping",
    "www.designerdrip.store",
  ]

  let footerY = 70
  for (const line of footerLines) {
    drawCentered(
      line,
      footerY,
      line === footerLines[0] ? 9 : 8,
      line === footerLines[0] ? boldFont : regularFont,
      rgb(0.4, 0.4, 0.4),
    )
    footerY -= 14
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
