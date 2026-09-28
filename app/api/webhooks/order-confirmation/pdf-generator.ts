import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// Monochrome palette — Saint Yve invoice
const COLOR_BLACK = rgb(0, 0, 0)
const COLOR_SECONDARY = rgb(0.33, 0.33, 0.33) // #555
const COLOR_MUTED = rgb(0.53, 0.53, 0.53) // #888
const COLOR_DIVIDER = rgb(0.9, 0.9, 0.9) // #E5E5E5

// Typographic scale — every size below relates to this single system
const SIZE_BRAND = 19
const SIZE_INVOICE_TITLE = 17
const SIZE_BODY = 10
const SIZE_METADATA = 9.5
const SIZE_LABEL = 7.5
const SIZE_FOOTER = 7.5

export async function generateInvoicePDF(order: any, orderItems: any[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const margin = 50
  const contentRight = width - margin

  // --- Text helpers -------------------------------------------------------

  const measureSpaced = (text: string, size: number, font: any, spacing: number) => {
    let total = 0
    for (const char of text) total += font.widthOfTextAtSize(char, size) + spacing
    return total - spacing
  }

  const drawSpaced = (
    text: string,
    x: number,
    y: number,
    size: number,
    font: any,
    color: any,
    spacing: number,
  ) => {
    let cursorX = x
    for (const char of text) {
      page.drawText(char, { x: cursorX, y, size, font, color })
      cursorX += font.widthOfTextAtSize(char, size) + spacing
    }
  }

  const drawSpacedRight = (
    text: string,
    rightX: number,
    y: number,
    size: number,
    font: any,
    color: any,
    spacing: number,
  ) => {
    const totalWidth = measureSpaced(text, size, font, spacing)
    drawSpaced(text, rightX - totalWidth, y, size, font, color, spacing)
  }

  const drawRight = (text: string, rightX: number, y: number, size: number, font: any, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: rightX - textWidth, y, size, font, color })
  }

  const drawCentered = (text: string, y: number, size: number, font: any, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color })
  }

  const truncate = (text: string, maxWidth: number, size: number, font: any) => {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
    let result = text
    while (result.length > 1 && font.widthOfTextAtSize(result + "…", size) > maxWidth) {
      result = result.slice(0, -1)
    }
    return result + "…"
  }

  const drawLine = (y: number, x1: number, x2: number, color: any, thickness = 0.75) => {
    page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color })
  }

  // --- Header — quiet, left-aligned, single point of hierarchy -----------

  let y = height - 56

  drawSpaced("SAINT YVE", margin, y, SIZE_BRAND, boldFont, COLOR_BLACK, 1.4)
  y -= 17
  page.drawText("Premium Resale & Authentication Studio", {
    x: margin,
    y,
    size: SIZE_BODY - 1,
    font: regularFont,
    color: COLOR_SECONDARY,
  })
  y -= 13
  page.drawText("Dubai · Germany · Worldwide Shipping", {
    x: margin,
    y,
    size: SIZE_LABEL + 1,
    font: regularFont,
    color: COLOR_MUTED,
  })
  y -= 12
  page.drawText("contact@saintyve.com", {
    x: margin,
    y,
    size: SIZE_LABEL + 1,
    font: regularFont,
    color: COLOR_MUTED,
  })

  y -= 22
  drawLine(y, margin, contentRight, COLOR_DIVIDER)
  y -= 36

  // --- Invoice title + metadata grid --------------------------------------

  const invoiceTitleY = y
  page.drawText("INVOICE", { x: margin, y: invoiceTitleY, size: SIZE_INVOICE_TITLE, font: boldFont, color: COLOR_BLACK })

  const invoiceNumber = `#SY-${order.id.slice(0, 8).toUpperCase()}`
  page.drawText(invoiceNumber, {
    x: margin,
    y: invoiceTitleY - 17,
    size: SIZE_METADATA,
    font: regularFont,
    color: COLOR_SECONDARY,
  })

  const orderDate = new Date(order.created_at).toLocaleDateString("en-GB").replace(/\//g, ".")
  const dueDate = new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-GB")
    .replace(/\//g, ".")

  const metadataRows: [string, string][] = [
    ["DATE", orderDate],
    ["DUE", dueDate],
    ["ORDER NO.", order.id.slice(0, 8).toUpperCase()],
    ["CUSTOMER ID", `C${order.id.slice(-7).toUpperCase()}`],
  ]

  const metadataLabelX = 350
  let metadataY = invoiceTitleY
  for (const [label, value] of metadataRows) {
    drawSpaced(label, metadataLabelX, metadataY, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)
    drawRight(value, contentRight, metadataY, SIZE_METADATA, regularFont, COLOR_BLACK)
    metadataY -= 17
  }

  y = Math.min(invoiceTitleY - 17, metadataY) - 32

  // --- Shipping ------------------------------------------------------------

  drawSpaced("SHIPPING TO", margin, y, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)
  y -= 17

  const shippingAddress = order.shipping_address || {}
  const shippingLines = [
    `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim(),
    shippingAddress.address || "",
    `${shippingAddress.postalCode || ""} ${shippingAddress.city || ""}`.trim(),
    shippingAddress.country || "",
  ].filter((line) => line)

  for (const line of shippingLines) {
    page.drawText(line, { x: margin, y, size: SIZE_BODY, font: regularFont, color: COLOR_BLACK })
    y -= 14
  }

  y -= 26

  // --- Line items table ------------------------------------------------

  const colItemX = margin
  const colQtyRight = 320
  const colUnitRight = 430
  const colTotalRight = contentRight
  const itemMaxWidth = colQtyRight - colItemX - 30

  drawSpaced("ITEM", colItemX, y, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)
  drawSpacedRight("QTY", colQtyRight, y, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)
  drawSpacedRight("UNIT PRICE", colUnitRight, y, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)
  drawSpacedRight("TOTAL", colTotalRight, y, SIZE_LABEL, regularFont, COLOR_MUTED, 0.6)

  y -= 9
  drawLine(y, margin, contentRight, COLOR_DIVIDER)
  y -= 22

  for (const item of orderItems) {
    const itemName = truncate(item.products?.name || "Product", itemMaxWidth, SIZE_BODY, regularFont)
    const size = item.product_variants?.size || ""
    const color = item.product_variants?.color || ""
    const details = [color, size].filter((d) => d).join(" · ")

    page.drawText(itemName, { x: colItemX, y, size: SIZE_BODY, font: regularFont, color: COLOR_BLACK })
    drawRight(item.quantity.toString(), colQtyRight, y, SIZE_METADATA, regularFont, COLOR_SECONDARY)
    drawRight(`EUR ${item.price.toFixed(2)}`, colUnitRight, y, SIZE_METADATA, regularFont, COLOR_SECONDARY)
    drawRight(`EUR ${(item.price * item.quantity).toFixed(2)}`, colTotalRight, y, SIZE_METADATA, regularFont, COLOR_BLACK)

    if (details) {
      y -= 13
      page.drawText(details, { x: colItemX, y, size: SIZE_LABEL + 1, font: regularFont, color: COLOR_MUTED })
    }

    y -= 20
    drawLine(y, margin, contentRight, COLOR_DIVIDER, 0.5)
    y -= 22
  }

  y -= 6

  // --- Totals ---------------------------------------------------------

  const totalsLabelX = 350

  page.drawText("Subtotal", { x: totalsLabelX, y, size: SIZE_METADATA, font: regularFont, color: COLOR_MUTED })
  drawRight(`EUR ${order.subtotal_amount?.toFixed(2) || "0.00"}`, contentRight, y, SIZE_METADATA, regularFont, COLOR_BLACK)
  y -= 18

  page.drawText("Shipping", { x: totalsLabelX, y, size: SIZE_METADATA, font: regularFont, color: COLOR_MUTED })
  drawRight(`EUR ${order.shipping_amount?.toFixed(2) || "0.00"}`, contentRight, y, SIZE_METADATA, regularFont, COLOR_BLACK)
  y -= 16

  drawLine(y, totalsLabelX, contentRight, COLOR_DIVIDER, 0.75)
  y -= 20

  page.drawText("Total", { x: totalsLabelX, y, size: SIZE_METADATA + 1.5, font: boldFont, color: COLOR_BLACK })
  drawRight(
    `EUR ${order.total_amount?.toFixed(2) || "0.00"}`,
    contentRight,
    y,
    SIZE_METADATA + 1.5,
    boldFont,
    COLOR_BLACK,
  )

  y -= 46

  // --- Authenticity guarantee — quiet brand statement, no box ------------

  const minBottomMargin = 96
  if (y < minBottomMargin) y = minBottomMargin

  drawSpaced("AUTHENTICITY GUARANTEE", margin, y, SIZE_LABEL, boldFont, COLOR_BLACK, 0.6)
  y -= 15
  page.drawText("All products sold by Saint Yve undergo multi-stage authentication", {
    x: margin,
    y,
    size: SIZE_LABEL + 1,
    font: regularFont,
    color: COLOR_SECONDARY,
  })
  y -= 12
  page.drawText("and quality verification.", {
    x: margin,
    y,
    size: SIZE_LABEL + 1,
    font: regularFont,
    color: COLOR_SECONDARY,
  })

  // --- Footer — discreet signature ---------------------------------------

  let footerY = 56
  drawCentered("Saint Yve® — Premium Resale & Authentication Studio", footerY, SIZE_FOOTER, regularFont, COLOR_MUTED)
  footerY -= 12
  drawCentered("Dubai · Germany · Worldwide Shipping", footerY, SIZE_FOOTER, regularFont, COLOR_MUTED)
  footerY -= 12
  drawCentered("www.saintyve.com", footerY, SIZE_FOOTER, regularFont, COLOR_MUTED)

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
