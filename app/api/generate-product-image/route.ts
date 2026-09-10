import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productName = formData.get("productName") as string
    const productCategory = formData.get("productCategory") as string
    const imageType = formData.get("imageType") as string
    const imageIndex = formData.get("imageIndex") as string
    const referenceImage = formData.get("referenceImage") as File | null
    const additionalPrompt = formData.get("additionalPrompt") as string | null

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[v0] OPENAI_API_KEY not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("[v0] Generating product image", imageIndex || "0", "for:", productName)
    console.log("[v0] Image type:", imageType)
    console.log("[v0] Has reference image:", !!referenceImage)

    if (imageType === "product-only" && referenceImage) {
      console.log("[v0] Product-only mode with reference: applying grey background")
      
      const backgroundPrompt = `Replace only the background of this product image with a clean, professional light grey studio background (hex: #E5E5E5). Keep the product exactly as shown - maintain all details, colors, textures, materials, stitching, logos, and proportions. The product should remain perfectly centered and sharp. Apply soft, diffused studio lighting with subtle shadows beneath the product for depth. Ultra-high quality, 4K resolution, professional e-commerce photography.`
      
      // Create FormData for image edit API
      const apiFormData = new FormData()
      apiFormData.append("image", referenceImage)
      apiFormData.append("prompt", backgroundPrompt)
      apiFormData.append("n", "1")
      apiFormData.append("size", "1024x1024")
      apiFormData.append("response_format", "b64_json")

      console.log("[v0] Using DALL-E 2 edit mode for background replacement...")

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: apiFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] OpenAI API error:", errorData)
        throw new Error(errorData.error?.message || "Failed to generate image")
      }

      const result = await response.json()

      if (!result.data || result.data.length === 0) {
        return NextResponse.json({ error: "AI model did not generate any images" }, { status: 500 })
      }

      const imageData = result.data[0].b64_json
      if (!imageData) {
        return NextResponse.json({ error: "No image data in response" }, { status: 500 })
      }

      const imageDataUrl = `data:image/png;base64,${imageData}`
      console.log("[v0] Successfully applied grey background to product image")

      return NextResponse.json({
        imageUrl: imageDataUrl,
        prompt: backgroundPrompt,
        metadata: {
          productName,
          imageType,
          hasReference: true,
          model: "dall-e-2-edit-background",
          quality: "1024x1024",
        },
      })
    }

    let prompt = ""
    if (imageType === "on-model") {
      prompt = `High-fashion editorial photograph of a model wearing ${productName}${productCategory ? ` (${productCategory})` : ""}, shot in a minimalist studio with soft gradient light grey background (#E5E5E5 to #F0F0F0). Soft diffused cinematic lighting, confident natural pose, luxury campaign aesthetic. The ${productName} is the focal point with ultra-sharp detail. Modern, calm, exclusive atmosphere. Professional fashion photography, maximum quality.`
    } else {
      prompt = `Professional luxury studio photograph of ${productName}${productCategory ? ` (${productCategory})` : ""}, perfectly centered on smooth clean light grey gradient background (#E5E5E5). Soft diffused studio lighting highlighting texture, materials and form with subtle shadow beneath for depth. Clean, minimal, ultra-sharp composition. High-end e-commerce product photography, maximum detail and quality.`
    }

    if (additionalPrompt) {
      prompt += ` ${additionalPrompt}`
    }

    const variations = [" Slightly angled view.", " Straight-on centered view.", " Alternative lighting angle."]
    const variationIndex = Number.parseInt(imageIndex || "0") % 3
    prompt += variations[variationIndex]

    console.log("[v0] Generated prompt:", prompt)
    console.log("[v0] Calling OpenAI DALL-E 2 API...")

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(errorData.error?.message || "Failed to generate image")
    }

    const result = await response.json()

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: "AI model did not generate any images" }, { status: 500 })
    }

    const imageData = result.data[0].b64_json
    if (!imageData) {
      return NextResponse.json({ error: "No image data in response" }, { status: 500 })
    }

    const imageDataUrl = `data:image/png;base64,${imageData}`
    console.log("[v0] Successfully generated image with DALL-E 2")

    return NextResponse.json({
      imageUrl: imageDataUrl,
      prompt,
      metadata: {
        productName,
        imageType,
        hasReference: false,
        model: "dall-e-2",
        quality: "1024x1024",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error generating product image:", error)

    let errorMessage = "Failed to generate product image"
    let errorDetails = "Unknown error"

    if (error instanceof Error) {
      errorDetails = error.message
    }

    if (error?.error?.type === "invalid_api_key" || error?.status === 401) {
      errorMessage = "Invalid OpenAI API key"
      errorDetails = "Please check that your OPENAI_API_KEY is valid"
    } else if (error?.error?.type === "insufficient_quota" || errorDetails.includes("quota")) {
      errorMessage = "OpenAI API quota exceeded"
      errorDetails = "Your OpenAI account has exceeded its quota"
    } else if (errorDetails.includes("invalid_image") || errorDetails.includes("image must be a valid PNG")) {
      errorMessage = "Invalid reference image format"
      errorDetails = "The reference image must be a PNG file with a transparent background (alpha channel). Please convert your image to PNG format with transparency before uploading."
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
