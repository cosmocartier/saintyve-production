"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ProductImageZoom } from "@/components/product-image-zoom"
import { useCart } from "@/contexts/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { ProductPageNavigation } from "@/components/navigation/product-page-navigation"
import { StaticNavigation } from "@/components/static-navigation"
import type { Product, ProductVariant, ProductImage, ProductVideo, FactoryMediaItem } from "@/lib/types/product"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Plus } from "lucide-react"
import { generateAltText } from "@/lib/generate-alt-text"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Footer } from "@/components/footer"
import { buildImageObject } from "@/lib/cloudflare/cloudflare-images"
import { ProductImageLightbox } from "@/components/product-page/product-image-lightbox"
import { ProductHero } from "@/components/product-page/product-hero"
import { ProductInfo } from "@/components/product-page/product-info"
import { BuildQualityBadge } from "@/components/build-quality-badge"
import { ProductRecommendations } from "@/components/product-page/product-recommendations"
import { usePriceMode } from "@/contexts/price-mode-context"
import { useWishlist } from "@/contexts/wishlist-context"

interface ProductPageClientProps {
  product: Product
  variants: ProductVariant[]
  images: ProductImage[]
  videos: ProductVideo[]
  factoryMedia?: FactoryMediaItem[]
  colorVariants?: Array<{
    id: string
    name: string
    slug: string
    color: string | null
    price: number
    primaryImage: string | null
    isCurrentProduct: boolean
  }>
}

export function ProductPageClient({
  product,
  variants,
  images,
  videos,
  factoryMedia = [],
  colorVariants = [],
  useCfImages,
}: ProductPageClientProps & { useCfImages: boolean }) {
  const { addItem, openCart } = useCart()
  const { toggleLike, isLiked } = useWishlist()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false)
  const [isShippingOpen, setIsShippingOpen] = useState(false)
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const { useRetailPrice } = usePriceMode()

  // Get the correct price based on the toggle state
  const displayPrice = useRetailPrice ? (product.retail_price || product.price) : product.price

  const availableColors = images
    .filter((img) => img.color_name && img.color_hex)
    .reduce(
      (acc, img) => {
        if (!acc.find((c) => c.name === img.color_name)) {
          acc.push({
            name: img.color_name!,
            hex: img.color_hex!,
            images: images.filter((i) => i.color_name === img.color_name),
            variants: variants.filter((v) => v.color === img.color_name),
          })
        }
        return acc
      },
      [] as Array<{ name: string; hex: string; images: ProductImage[]; variants: ProductVariant[] }>,
    )

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const firstColor = availableColors[0]
      setSelectedColor(firstColor.name)
      if (
        firstColor.variants.length === 1 ||
        !firstColor.variants.some((v) => v.size && v.size.toLowerCase() !== "one size")
      ) {
        setSelectedVariant(firstColor.variants[0])
      }
    }
  }, [availableColors, selectedColor])

  const filteredVariants = selectedColor
    ? availableColors.find((color) => color.name === selectedColor)?.variants || []
    : variants

  const filteredImages = selectedColor
    ? availableColors.find((color) => color.name === selectedColor)?.images || []
    : images

  const hasMultipleSizes =
    filteredVariants.length > 1 && filteredVariants.some((v) => v.size && v.size.toLowerCase() !== "one size")

  const structuredImages = images.map((img) =>
    buildImageObject({
      id: img.id,
      url: img.url,
      cf_image_id: img.cf_image_id,
      alt_text: img.alt_text,
    }),
  )

  const filteredStructuredImages = selectedColor
    ? availableColors
        .find((color) => color.name === selectedColor)
        ?.images.map((img) =>
          buildImageObject({
            id: img.id,
            url: img.url,
            cf_image_id: (img as any).cf_image_id,
            alt_text: img.alt_text,
          }),
        ) || []
    : structuredImages

  const displayImages = filteredImages.length > 0 ? filteredImages.map((img) => img.url) : [product.image]
  const displayVideos = videos.map((v) => v.video_url)
  const allMedia = [...displayVideos, ...displayImages]

  const cartImage = filteredImages.length > 0 ? filteredImages[0].url : product.image

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  useEffect(() => {
    if (filteredVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(filteredVariants[0])
    }
  }, [filteredVariants, selectedVariant])

  useEffect(() => {
    if (selectedColor && selectedVariant && selectedVariant.color !== selectedColor) {
      setSelectedVariant(null)
    }
  }, [selectedColor, selectedVariant])

  const handleAddToCart = () => {
    if (!hasMultipleSizes && !selectedVariant && filteredVariants.length > 0) {
      setSelectedVariant(filteredVariants[0])
    }

    if (hasMultipleSizes && !selectedVariant) {
      return
    }

    const variantToAdd = selectedVariant || (filteredVariants.length > 0 ? filteredVariants[0] : null)

    if (!variantToAdd) {
      return
    }

    setIsAddingToCart(true)
    addItem({
      id: product.id,
      name: product.name,
      price: `EUR ${displayPrice.toFixed(2)}`,
      image: cartImage,
      variant: variantToAdd.size || undefined,
      variantId: variantToAdd.id || undefined,
      color: variantToAdd.color || selectedColor || undefined,
      slug: product.slug,
    })

    setTimeout(() => {
      setIsAddingToCart(false)
      openCart()
    }, 300)
  }

  const handleAITryOn = () => {
    if (!user) {
      toast({
        title: "Sign-In First",
        description: (
          <div className="flex flex-col gap-2">
            <p>Please sign in to use AI Try-On</p>
            <Link
              href="/auth/login"
              className="text-xs font-medium tracking-widest uppercase underline hover:text-zinc-600"
            >
              Go to Sign-In →
            </Link>
          </div>
        ),
        duration: 5000,
      })
    } else {
      router.push("/account#ai-tryon")
    }
  }

  const canAddToCart =
    filteredVariants.length === 0 || !hasMultipleSizes || (selectedVariant && selectedVariant.stock_quantity > 0)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubscribing(true)

    try {
      const { error } = await supabase.from("newsletter_emails").insert([{ email: newsletterEmail }])

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
          })
        } else {
          throw error
        }
      } else {
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const brandName = product.name?.split(" ")[0] || null

  const toggleSizeDropdown = () => {
    setIsSizeDropdownOpen(!isSizeDropdownOpen)
  }

  const handleSizeSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setIsSizeDropdownOpen(false)
  }

  const handleImageClick = (index: number) => {
    // Skip videos when clicking
    const imageIndex = index - displayVideos.length
    if (imageIndex >= 0) {
      setLightboxIndex(imageIndex)
      setIsLightboxOpen(true)
    }
  }

  const handleToggleWishlist = async () => {
    await toggleLike({
      id: product.id,
      name: product.name,
      price: `EUR ${displayPrice.toFixed(2)}`,
      image: cartImage,
      slug: product.slug,
    })
  }

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <CartSidebar />

      <ProductPageNavigation />
      <div className="hidden lg:block">
        <StaticNavigation />
      </div>

      <ProductImageLightbox
        images={filteredStructuredImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      <div className="lg:pt-[50px]">
        <ProductHero
          product={product}
          brandName={brandName}
          colorName={selectedColor || availableColors[0]?.name || null}
          allMedia={allMedia}
          videoCount={displayVideos.length}
          imageAltTexts={displayImages.map((_, i) => filteredImages[i]?.alt_text)}
          displayPrice={displayPrice}
          basePrice={displayPrice}
          discountedPrice={
            product.discounted_price != null &&
            product.discounted_price !== 0 &&
            Number.isFinite(product.discounted_price)
              ? product.discounted_price
              : null
          }
          onImageClick={handleImageClick}
          onDetailsClick={() => setIsProductDetailsOpen(true)}
        />

        <ProductInfo
          product={product}
          brandName={brandName}
          colorVariants={colorVariants}
          availableColors={availableColors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          setCurrentImageIndex={setCurrentImageIndex}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          hasMultipleSizes={hasMultipleSizes}
          isSizeDropdownOpen={isSizeDropdownOpen}
          toggleSizeDropdown={toggleSizeDropdown}
          filteredVariants={filteredVariants}
          handleSizeSelect={handleSizeSelect}
          handleAddToCart={handleAddToCart}
          canAddToCart={canAddToCart}
          isAddingToCart={isAddingToCart}
          setIsShippingOpen={setIsShippingOpen}
          isInWishlist={isLiked(product.id)}
          onToggleWishlist={handleToggleWishlist}
        />
      </div>

      <Sheet open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] lg:max-w-[600px] overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/10">
            <SheetTitle className="text-left text-base font-normal tracking-wide">Product details</SheetTitle>
          </SheetHeader>

          <div className="px-6 py-6 space-y-8">
            {/* Product Description Section */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium tracking-wide">Description</h3>
                <div
                  className="text-sm text-zinc-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Hairline divider */}
            {product.description && product.product_details && <div className="border-t border-black/10" />}

            {/* Product Details Section */}
            {product.product_details && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium tracking-wide">Product details</h3>
                <div
                  className="text-sm text-zinc-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.product_details }}
                />
              </div>
            )}

            {/* Hairline divider */}
            {product.product_details && product.size_and_fit && <div className="border-t border-black/10" />}

            {/* Size & Fit Section */}
            {product.size_and_fit && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium tracking-wide">Size & Fit</h3>
                <div className="text-sm text-zinc-700 leading-relaxed space-y-3">
                  <div dangerouslySetInnerHTML={{ __html: product.size_and_fit }} />
                  {(product.category === "Sneaker" || product.category === "Jacket" || product.category === "Vest") && (
                    <p className="text-sm text-zinc-600">
                      For more detailed sizing information, please refer to our{" "}
                      <Link href="/size-guide" className="text-zinc-700 hover:underline transition-all">
                        Size Guide
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Hairline divider */}
            {product.size_and_fit && <div className="border-t border-black/10" />}

            {/* Materials & Care Section (hardcoded placeholder for now) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium tracking-wide">Materials and care</h3>
              <div className="text-sm text-zinc-700 leading-relaxed space-y-2">
                <p>Handle with care. Avoid exposure to direct sunlight and heat.</p>
                <p>Clean with a soft, dry cloth. Do not use chemicals or abrasive materials.</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isShippingOpen} onOpenChange={setIsShippingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[500px] lg:max-w-[600px] overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/10">
            <SheetTitle className="text-left text-base font-normal tracking-wide">Free shipping and returns</SheetTitle>
          </SheetHeader>

          <div className="px-6 py-6 space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-zinc-700 leading-relaxed">Free shipping on all orders.</p>
              <p className="text-sm text-zinc-700 leading-relaxed">14-day returns & exchanges.</p>
              <p className="text-sm text-zinc-700 leading-relaxed">Support via WhatsApp & Email.</p>
            </div>

            <div className="border-t border-black/10 pt-6 space-y-3">
              <h3 className="text-sm font-medium tracking-wide">Contact us</h3>
              <div className="space-y-2 text-sm text-zinc-700">
                <p>
                  <a
                    href="https://wa.me/yourwhatsappnumber"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    aria-label="WhatsApp"
                  >
                    WhatsApp Support
                  </a>
                </p>
                <p>
                  <a href="mailto:support@designerdrip.com" className="hover:underline">
                    support@designerdrip.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Recommendations */}
      <ProductRecommendations currentProductId={product.id} brand={(product as any).brand || null} />

      {/* Build Quality Badge */}
      <BuildQualityBadge replicationAccuracy={product.replication_accuracy} isProductPage={true} />

      <Footer />
    </div>
  )
}

export default ProductPageClient
