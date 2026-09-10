import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, model, color, category } = body

    console.log("[v0] API received request:", { brand, model, color, category })

    // Validate required fields
    if (!brand || !model || !color || !category) {
      return NextResponse.json({ error: "Brand, model, color, and category are required" }, { status: 400 })
    }

    // Banned terms that must NEVER appear
    const bannedTerms = [
      "replica",
      "rep",
      "fake",
      "1:1",
      "authentic",
      "best",
      "perfect",
      "ultimate",
      "must-have",
      "buy",
      "shop",
      "limited",
      "exclusive",
    ]

    console.log("[v0] Starting AI text generation...")

    // Generate first paragraph only with strict constraints
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a luxury fashion copywriter for DesignerDrip, a premium designer marketplace.

TASK: Generate ONE paragraph introducing this product. This is paragraph 1 only.

STRICT INPUT (source of truth):
- Brand: ${brand}
- Model: ${model}
- Color: ${color}
- Category: ${category}

MANDATORY STRUCTURE:
- ONE paragraph only (2-3 sentences)
- 45-70 words total
- NO line breaks, NO headings, NO bullets
- Must mention Brand + Model + Color naturally
- Must reference the category (${category})
- Describe the design and aesthetic

TONE REQUIREMENTS:
- Luxury-editorial, calm, authoritative
- Confident and understated
- Sound like a design magazine, not a sales page

ABSOLUTE PROHIBITIONS:
- DO NOT mention: materials, specs, price, availability, release history
- DO NOT use: ${bannedTerms.join(", ")}
- DO NOT use superlatives or sales language
- NO keyword stuffing

PURPOSE:
Answer "What is this product?" in one calm, editorial introduction.

Example structure (do NOT copy):
Sentence 1: Product identity
Sentence 2: Design language / silhouette  
Sentence 3 (optional): Positioning or feel

Write ONLY the paragraph. No preamble, no extra text.`,
      temperature: 0.6,
      maxTokens: 150,
    })

    const generatedText = text.trim()
    console.log("[v0] AI generated text:", generatedText)
    console.log("[v0] Generated text length:", generatedText.length)

    // Validate output against banned terms
    const lowerText = generatedText.toLowerCase()
    const foundBannedTerm = bannedTerms.find((term) => lowerText.includes(term.toLowerCase()))

    if (foundBannedTerm) {
      console.error("[v0] Banned term detected:", foundBannedTerm)
      return NextResponse.json(
        { error: `Generated content contains prohibited term: ${foundBannedTerm}. Please try again.` },
        { status: 400 },
      )
    }

    // Validate word count (45-70 words)
    const wordCount = generatedText.split(/\s+/).length
    console.log("[v0] Word count:", wordCount)
    if (wordCount < 40 || wordCount > 80) {
      console.warn("[v0] Word count outside target range:", wordCount)
    }

    const response = { description: generatedText }
    console.log("[v0] Sending response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Paragraph generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate paragraph",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
