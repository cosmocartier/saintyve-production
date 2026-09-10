"use server"

import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

interface GenerateSizeFitInput {
  productId: string
}

interface GenerateSizeFitResponse {
  success: boolean
  sizeFitText?: string
  error?: string
  missingFields?: string[]
}

export async function generateSizeFit(input: GenerateSizeFitInput): Promise<GenerateSizeFitResponse> {
  try {
    const supabase = await createClient()

    // Check authentication and authorization
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized: Please log in" }
    }

    // Check if user is admin or supplier
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || (profile.role !== "admin" && profile.role !== "supplier")) {
      return { success: false, error: "Unauthorized: Admin or supplier access required" }
    }

    // Fetch product with all attributes
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        id,
        category,
        brand,
        model,
        color,
        fit_profile,
        sizing_recommendation,
        silhouette,
        weight_feel,
        seasonality,
        closure_type,
        lining_type,
        dimension_width_cm,
        dimension_height_cm,
        dimension_depth_cm,
        carry_style,
        capacity_type,
        size_mm,
        fastening_type,
        length_cm
      `,
      )
      .eq("id", input.productId)
      .single()

    if (fetchError || !product) {
      return { success: false, error: "Product not found" }
    }

    // Validate required fields by category
    const missingFields: string[] = []

    if (!product.category) {
      return { success: false, error: "Product category is required" }
    }

    // Category-specific validation
    switch (product.category) {
      case "Sneaker":
        // Sneakers need fit_profile for sizing guidance
        if (!product.fit_profile) missingFields.push("Fit Profile")
        break

      case "Jacket":
      case "Vest":
        // Apparel needs fit_profile and silhouette
        if (!product.fit_profile) missingFields.push("Fit Profile")
        if (!product.silhouette) missingFields.push("Silhouette")
        break

      case "Bag":
      case "Accessory":
        // Bags need dimensions
        if (!product.dimension_width_cm || !product.dimension_height_cm) {
          missingFields.push("Dimensions (Width and Height required)")
        }
        break

      case "Watch":
        // Watches need case size
        if (!product.size_mm) missingFields.push("Case Size (mm)")
        break

      case "Jewelry":
        // Jewelry needs length
        if (!product.length_cm) missingFields.push("Length (cm)")
        break
    }

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields for ${product.category}`,
        missingFields,
      }
    }

    // Build category-specific prompt
    let categoryPrompt = ""

    switch (product.category) {
      case "Sneaker":
        categoryPrompt = `
CATEGORY: Sneaker
ATTRIBUTES:
- Fit Profile: ${product.fit_profile || "N/A"}
- Sizing Recommendation: ${product.sizing_recommendation || "N/A"}
- Silhouette: ${product.silhouette || "N/A"}
- Closure Type: ${product.closure_type || "N/A"}

REQUIRED SEMANTIC ORDER:
1. Fit (true to size / sizing behavior)
2. Sizing recommendation
3. Optional: silhouette or closure detail

TARGET LENGTH: 1-2 sentences (max 3), 40-65 words total

EXAMPLE OUTPUT (quality benchmark):
"The sneaker fits true to size with a standard width. For a more relaxed fit, we recommend taking a half size up."

Write naturally. Merge information into flowing sentences.`
        break

      case "Jacket":
      case "Vest":
        categoryPrompt = `
CATEGORY: ${product.category}
ATTRIBUTES:
- Fit Profile: ${product.fit_profile || "N/A"}
- Silhouette: ${product.silhouette || "N/A"}
- Sizing Recommendation: ${product.sizing_recommendation || "N/A"}
- Lining Type: ${product.lining_type || "N/A"}
- Closure Type: ${product.closure_type || "N/A"}

REQUIRED SEMANTIC ORDER:
1. Silhouette and fit description
2. Layering note (ONLY if silhouette is oversized/relaxed)
3. Sizing recommendation

TARGET LENGTH: 1-2 sentences (max 3), 45-70 words total

EXAMPLE OUTPUT (quality benchmark):
"Designed with a boxy silhouette, the piece fits true to size and offers a relaxed structure suitable for comfortable layering. For the intended fit, we recommend taking your usual size."

Merge details into natural, flowing sentences. Mention layering ONLY if the silhouette supports it.`
        break

      case "Bag":
      case "Accessory":
        categoryPrompt = `
CATEGORY: ${product.category}
ATTRIBUTES:
- Width: ${product.dimension_width_cm || "N/A"} cm
- Height: ${product.dimension_height_cm || "N/A"} cm
- Depth: ${product.dimension_depth_cm || "N/A"} cm
- Carry Style: ${product.carry_style || "N/A"}
- Capacity Type: ${product.capacity_type || "N/A"}

REQUIRED SEMANTIC ORDER:
1. Dimensions (W × H × D format)
2. Carry style and capacity

TARGET LENGTH: 1-2 sentences, 35-55 words total

EXAMPLE OUTPUT (quality benchmark):
"Measures 32 × 28 × 14 cm. Designed for crossbody wear with medium capacity suitable for daily essentials."

No fit language. State dimensions, then describe carry style and use.`
        break

      case "Watch":
        categoryPrompt = `
CATEGORY: Watch
ATTRIBUTES:
- Case Size: ${product.size_mm || "N/A"} mm
- Fastening Type: ${product.fastening_type || "N/A"}

REQUIRED SEMANTIC ORDER:
1. Case size
2. Fastening type and brief wear note

TARGET LENGTH: 1-2 sentences, 30-45 words total

EXAMPLE OUTPUT (quality benchmark):
"Features a 40mm case diameter. The deployant clasp fastening is suitable for medium to large wrists."

Keep brief and factual.`
        break

      case "Jewelry":
        categoryPrompt = `
CATEGORY: Jewelry
ATTRIBUTES:
- Length: ${product.length_cm || "N/A"} cm
- Fastening Type: ${product.fastening_type || "N/A"}

REQUIRED SEMANTIC ORDER:
1. Length
2. Fastening type and brief wear note

TARGET LENGTH: 1-2 sentences, 30-45 words total

EXAMPLE OUTPUT (quality benchmark):
"Measures 45 cm in length. The lobster clasp closure allows for adjustable sizing."

Keep brief and factual.`
        break

      default:
        return { success: false, error: `Unsupported category: ${product.category}` }
    }

    // Generate Size & Fit text using AI
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an editorial copywriter for DesignerDrip, a premium fashion marketplace.

TASK: Generate Size & Fit copy using ONLY the provided product attributes.

STRICT LANGUAGE RULES:

BANNED PHRASES (never use):
- "fit profile"
- "this cut allows"
- "this profile"
- "designed to allow"
- "engineered to"
- "ensures a perfect fit"
- "guarantees"

BANNED WORDS:
- perfect
- best
- ultimate
- must-have
- guaranteed
- replica
- fake

REQUIRED TONE:
- Calm, factual, neutral, confident
- Non-promotional
- No hype, no emojis, no marketing language
- Sound like human-written editorial copy

SENTENCE STRUCTURE:
- 1-2 sentences preferred (max 3)
- Merge information into natural flowing sentences
- No bullet points
- Prioritize readability over mechanical clarity

${categoryPrompt}

OUTPUT ONLY THE SIZE & FIT TEXT. No preamble. No extra commentary. Write as if for a premium fashion editorial.`,
      temperature: 0.3,
      maxTokens: 120,
    })

    const generatedText = text.trim()

    // Basic validation
    if (generatedText.length < 20) {
      return { success: false, error: "Generated text is too short" }
    }

    const bannedTerms = [
      "perfect",
      "best",
      "ultimate",
      "must-have",
      "guaranteed",
      "replica",
      "fake",
      "fit profile",
      "this cut allows",
      "this profile",
      "designed to allow",
      "engineered to",
      "ensures a perfect fit",
    ]
    const lowerText = generatedText.toLowerCase()
    const foundBannedTerm = bannedTerms.find((term) => lowerText.includes(term))

    if (foundBannedTerm) {
      return { success: false, error: `Generated text contains prohibited phrase: "${foundBannedTerm}"` }
    }

    return {
      success: true,
      sizeFitText: generatedText,
    }
  } catch (error) {
    console.error("[v0] Size & Fit generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate Size & Fit text",
    }
  }
}
