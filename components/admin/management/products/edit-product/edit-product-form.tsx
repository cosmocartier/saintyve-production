"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Upload, GripVertical, Plus, Trash2, Save, Sparkles, Wand2 } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/admin/management/products/edit-product/rich-text-editor"
import { ToastNotification } from "@/components/admin/management/products/edit-product/toast-notification"
import { generateProductSlug, ensureUniqueSlug, generateDisplayTitle } from "@/lib/utils/slug-generator"
// Import toast from react-hot-toast
import { toast } from "sonner"
// Import generateSizeFit action
import { generateSizeFit } from "@/app/actions/generate-size-fit"
import { CloudflareImagesSection } from "@/components/admin/management/products/edit-product/product-images"
import { CategoryImagesSection } from "@/components/admin/management/products/edit-product/category-images"
import { ProductIdentity } from "@/components/admin/management/products/edit-product/product-identity"
import { ProductAttributes } from "@/components/admin/management/products/edit-product/product-attributes"
import { ProductDescription } from "@/components/admin/management/products/edit-product/product-description"
import { ProductVariants } from "@/components/admin/management/products/edit-product/product-variants"
import { ProductBadges } from "@/components/admin/management/products/edit-product/product-badges"
import { ProductStatus } from "@/components/admin/management/products/edit-product/product-status"
import { ProductVideos } from "@/components/admin/management/products/edit-product/product-videos"
import { ProductCategories } from "@/components/admin/management/products/edit-product/product-categories"
import { FactoryMediaManager } from "@/components/admin/management/products/edit-product/factory-media-manager"
import type { FactoryMediaItem } from "@/lib/types/product"

const CATEGORIES = ["Accessory", "Bag", "Outerwear", "Clothing", "Shoe"] as const
const GENDERS = ["Men", "Women", "Unisex"] as const

const SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  Men: {
    Accessory: ["Belt", "Cardholder", "Hat & Cap", "Jewelry", "Scarves", "Sunglasses", "Tech-Accessory"],
    Bag: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Vest", "Windbreaker"],
    Clothing: ["Shirt", "T-Shirt", "Jeans", "Pants", "Shorts"],
    Shoe: ["Boots", "Dress Shoes", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Women: {
    Accessory: ["Belt", "Hair Accessor", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory"],
    Bag: ["Crossbody Bag", "Mini Bag", "Shoulder Bag", "Top Handle Bag", "Tote Bag", "Travel Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat"],
    Clothing: ["Pants", "Jeans", "Dress", "Shirt", "T-Shirt", "Shorts"],
    Shoe: ["Boots", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
  Unisex: {
    Accessory: ["Belt", "Cardholder", "Hair Accessory", "Hat & Cap", "Jewelry", "Scarve", "Sunglasses", "Tech-Accessory"],
    Bag: ["Backpack", "Briefcase", "Crossbody Bag", "Duffel Bag", "Mini Bag", "Shoulder Bag", "Tote Bag", "Travel Bag", "Top Handle Bag", "Wallet"],
    Outerwear: ["Bomber Jacket", "Down Jacket", "Leather Jacket", "Parka", "Puffer Jacket", "Trench Coat", "Wool Coat", "Vest", "Windbreaker"],
    Clothing: ["T-Shirt", "Shirt", "Dress", "Jeans", "Pants", "Shorts"],
    Shoe: ["Boots", "Dress Shoes", "Flats", "Heels", "Loafers", "Trainers", "Sandals", "Slides", "Sneakers"],
  },
}

interface ProductImage {
  id: string
  url: string
  display_order: number
  alt_text: string | null
  color_name?: string | null
  color_hex?: string | null
}

// Added ProductVideo interface
interface ProductVideo {
  id: string
  product_id: string
  video_url: string
  display_order: number
}

interface ProductVariant {
  id: string
  sku: string
  size: string | null
  color: string | null
  stock_quantity: number
  price_adjustment: number | null
}

interface ProductCategory {
  category_id: string
  sort_order: number
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  retail_price: number | null
  discounted_price: number | null
  category: string
  category_id: string | null
  slug: string
  status: string
  created_at: string
  updated_at: string
  product_images: Array<ProductImage>
  product_variants: Array<ProductVariant>
  product_categories: Array<ProductCategory>
  meta_title: string | null
  meta_description: string | null
  product_details: string | null
  size_and_fit: string | null
  materials_and_care: string | null
  our_commitment: string | null
  seo_keywords: string | null
  is_bestseller: boolean
  is_new_in: boolean
  brand: string | null
  model: string | null
  color: string | null
  material: string | null
  style_type: string | null
  color_filter: string | null
  fit_profile: string | null
  sizing_recommendation: string | null
  weight_feel: string | null
  seasonality: string[] | null
  silhouette: string | null
  closure_type: string | null
  lining_type: string | null
  dimension_width_cm: number | null
  dimension_height_cm: number | null
  dimension_depth_cm: number | null
  capacity_type: string | null
  carry_style: string | null
  size_mm: number | null
  length_cm: number | null
  fastening_type: string | null
  statement_level: string | null
  drop_context: string | null
  parent_product_name: string | null
  gender: string | null
  sub_category: string | null
  heel_height_cm: number | null
  replication_accuracy: number | null
  // Added use_cloudflare_images field
  use_cloudflare_images?: boolean | null
}

interface EditProductFormProps {
  product: Product
  cfImages?: Array<{
    id: string
    product_id: string
    cf_image_id: string
    role: "primary" | "hover" | "gallery"
    sort_order: number
    alt_text: string | null
    created_at: string
  }>
  categoryImages?: Array<{
    id: string
    product_id: string
    cf_image_id: string
    category_image: boolean
    sort_order: number
    alt_text: string | null
    created_at: string
  }>
  factoryMedia?: FactoryMediaItem[]
}

export default function EditProductForm({
  product: initialProduct,
  cfImages = [],
  categoryImages = [],
  factoryMedia = [],
}: EditProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const aiRefInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Renamed state variable to reflect it's the initial product data
  const [product, setProduct] = useState<Product>({
    ...initialProduct,
    // Ensure nested arrays are not undefined
    product_images: initialProduct.product_images || [],
    product_variants: initialProduct.product_variants || [],
    // Initialize meta_description
    meta_description: initialProduct.meta_description || "",
    // Initialize product_categories for accurate initial check
    product_categories: initialProduct.product_categories || [],
    // Initialize new fields
    brand: initialProduct.brand || "",
    model: initialProduct.model || "",
    color: initialProduct.color || "",
    // Initialize material and style_type
    material: initialProduct.material || "",
    style_type: initialProduct.style_type || "",
    color_filter: initialProduct.color_filter || "",
    fit_profile: initialProduct.fit_profile || null,
    sizing_recommendation: initialProduct.sizing_recommendation || null,
    weight_feel: initialProduct.weight_feel || null,
    seasonality: initialProduct.seasonality || null,
    silhouette: initialProduct.silhouette || null,
    closure_type: initialProduct.closure_type || null,
    lining_type: initialProduct.lining_type || null,
    dimension_width_cm: initialProduct.dimension_width_cm || null,
    dimension_height_cm: initialProduct.dimension_height_cm || null,
    dimension_depth_cm: initialProduct.dimension_depth_cm || null,
    capacity_type: initialProduct.capacity_type || null,
    carry_style: initialProduct.carry_style || null,
    size_mm: initialProduct.size_mm || null,
    length_cm: initialProduct.length_cm || null,
    fastening_type: initialProduct.fastening_type || null,
    statement_level: initialProduct.statement_level || null,
    drop_context: initialProduct.drop_context || null,
    parent_product_name: initialProduct.parent_product_name || null,
    gender: initialProduct.gender || null,
    sub_category: initialProduct.sub_category || null,
    heel_height_cm: initialProduct.heel_height_cm || null,
    replication_accuracy: initialProduct.replication_accuracy || null,
    retail_price: initialProduct.retail_price || null,
    discounted_price: initialProduct.discounted_price ?? null,
  })

  const [formData, setFormData] = useState({
    brand: product.brand || "",
    model: product.model || "",
    color: product.color || "",
    name: product.name,
    description: product.description || "",
    price: product.price,
    retail_price: product.retail_price || null,
    discounted_price: product.discounted_price ?? null,
    category: product.category || "",
    sub_category: product.sub_category || "",
    material: product.material || "",
    style_type: product.style_type || "",
    color_filter: product.color_filter || "",
    slug: product.slug,
    status: product.status || "draft",
    meta_title: product.meta_title || "",
    meta_description: product.meta_description || "",
    product_details: product.product_details || "",
    size_and_fit: product.size_and_fit || "",
    materials_and_care: product.materials_and_care || "",
    our_commitment: product.our_commitment || "",
    seo_keywords: product.seo_keywords || "",
    is_bestseller: product.is_bestseller || false,
    is_new_in: product.is_new_in || false,
    fit_profile: product.fit_profile || "",
    sizing_recommendation: product.sizing_recommendation || "",
    weight_feel: product.weight_feel || "",
    seasonality: product.seasonality || [],
    silhouette: product.silhouette || "",
    closure_type: product.closure_type || "",
    lining_type: product.lining_type || "",
    dimension_width_cm: product.dimension_width_cm || null,
    dimension_height_cm: product.dimension_height_cm || null,
    dimension_depth_cm: product.dimension_depth_cm || null,
    capacity_type: product.capacity_type || "",
    carry_style: product.carry_style || "",
    size_mm: product.size_mm || null,
    length_cm: product.length_cm || null,
    fastening_type: product.fastening_type || "",
    statement_level: product.statement_level || "",
    drop_context: product.drop_context || "",
    parent_product_name: product.parent_product_name || "",
    gender: product.gender || "",
    sub_category: product.sub_category || "",
    heel_height_cm: product.heel_height_cm || null,
    replication_accuracy: product.replication_accuracy || null,
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [categorySearch, setCategorySearch] = useState("")

  // Track multiple categories instead of single category_id
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; parent_id: string | null; main_category: string | null }>
  >([])

  // State for Size & Fit generation
  const [isGeneratingSizeFit, setIsGeneratingSizeFit] = useState(false)
  const [showSizeFitReplaceDialog, setShowSizeFitReplaceDialog] = useState(false)
  const [pendingSizeFitText, setPendingSizeFitText] = useState("")

  const [useCloudflare, setUseCloudflare] = useState(initialProduct.use_cloudflare_images || false)

  useEffect(() => {
    // Fetch categories and assignments
    const fetchCategoriesAndAssignments = async () => {
      // This is for the product_categories table (organizing products into browsing categories)
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, parent_id, main_category")
        .order("display_order", { ascending: true })

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Fetch product's current category assignments
      const { data: productCategoriesData } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", product.id)

      if (productCategoriesData) {
        setSelectedCategories(new Set(productCategoriesData.map((pc) => pc.category_id)))
      }
    }
    fetchCategoriesAndAssignments()
  }, [product.id])

  const [images, setImages] = useState<ProductImage[]>([])
  const [videos, setVideos] = useState<ProductVideo[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>(product.product_variants)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Removed AI Image Generation State variables
  const [deleting, setDeleting] = useState(false)

  const [editingImageAlt, setEditingImageAlt] = useState<string | null>(null)
  const [tempAltText, setTempAltText] = useState("")

  const [editingImageColor, setEditingImageColor] = useState<string | null>(null)
  const [tempColorName, setTempColorName] = useState("")
  const [tempColorHex, setTempColorHex] = useState("#000000")

  const [aiDescriptionGenerating, setAiDescriptionGenerating] = useState(false)



  const availableColors = images
    .filter((img) => img.color_name && img.color_hex)
    .reduce(
      (acc, img) => {
        if (!acc.find((c) => c.name === img.color_name)) {
          acc.push({ name: img.color_name!, hex: img.color_hex! })
        }
        return acc
      },
      [] as Array<{ name: string; hex: string }>,
    )

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleBrandModelColorChange = (field: "brand" | "model" | "color", value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    setProduct((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)

    // Auto-generate slug if not manually edited
    if (!slugManuallyEdited && newFormData.brand && newFormData.model && newFormData.color) {
      const newSlug = generateProductSlug(newFormData.brand, newFormData.model, newFormData.color)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
      setProduct((prev) => ({ ...prev, slug: newSlug }))
    }

    // Update display name
    if (newFormData.brand && newFormData.model && newFormData.color) {
      const displayName = generateDisplayTitle(newFormData.brand, newFormData.model, newFormData.color)
      setFormData((prev) => ({ ...prev, name: displayName }))
      setProduct((prev) => ({ ...prev, name: displayName }))
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
    setProduct({ ...product, name, slug: generateSlug(name) })
    setHasUnsavedChanges(true)
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: value }))
    setProduct((prev) => ({ ...prev, slug: value }))
    setHasUnsavedChanges(true)
  }

  const handleResetSlug = () => {
    if (formData.brand && formData.model && formData.color) {
      const newSlug = generateProductSlug(formData.brand, formData.model, formData.color)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
      setProduct((prev) => ({ ...prev, slug: newSlug }))
      setSlugManuallyEdited(false)
      setHasUnsavedChanges(true)
    }
  }

  // Handle input changes and update both formData and the product state for change tracking
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setProduct((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Check authentication first
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to upload images")
      }

      const uploadPromises = Array.from(files).map(async (file, index) => {
        console.log(`[v0] Uploading file ${index + 1}/${files.length}: ${file.name}`)

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file. Please select only image files.`)
        }

        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
          throw new Error(`${file.name} is ${sizeMB}MB. Images must be less than 5MB.`)
        }

        console.log(`[v0] File validation passed for: ${file.name}`)

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${product.id}_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        console.log(`[v0] Uploading to path: ${filePath}`)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(`[v0] Upload error for ${file.name}:`, uploadError)
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        console.log(`[v0] Upload successful for: ${file.name}`)

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath)

        console.log(`[v0] Public URL generated: ${publicUrl}`)

        // Insert into product_images table
        const { data: imageData, error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            url: publicUrl,
            display_order: images.length + index,
            alt_text: formData.name, // Default alt text to product name
          })
          .select()
          .single()

        if (imageError) {
          console.error(`[v0] Database insert error for ${file.name}:`, imageError)
          // Clean up uploaded file if database insert fails
          await supabase.storage.from("product-images").remove([filePath])
          throw new Error(`Failed to save ${file.name} to database: ${imageError.message}`)
        }

        console.log(`[v0] Image saved to database successfully`)
        return imageData
      })

      const newImages = await Promise.all(uploadPromises)
      setImages([...images, ...newImages])
      setSuccess(`Successfully uploaded ${newImages.length} image(s)`)
      setTimeout(() => setSuccess(null), 3000)
      setHasUnsavedChanges(true) // Mark as unsaved changes after upload
    } catch (err) {
      console.error("[v0] Image upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId)

      if (deleteError) throw deleteError

      // Delete from storage (extract path from URL)
      const urlParts = imageUrl.split("/")
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `products/${fileName}`

      await supabase.storage.from("product-images").remove([filePath])

      // Update local state and reorder
      const updatedImages = images.filter((img) => img.id !== imageId)
      const reorderedImages = updatedImages.map((img, index) => ({
        ...img,
        display_order: index,
      }))
      setImages(reorderedImages)

      // Update display order in database
      await Promise.all(
        reorderedImages.map((img) =>
          supabase.from("product_images").update({ display_order: img.display_order }).eq("id", img.id),
        ),
      )

      setSuccess("Image deleted successfully")
      setTimeout(() => setSuccess(null), 3000)
      setHasUnsavedChanges(true) // Mark as unsaved changes after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image")
    }
  }

  // Handle drag and drop for image reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    // Update display_order
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }))

    setImages(reorderedImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      // Update display order in database
      await Promise.all(
        images.map((img) =>
          supabase.from("product_images").update({ display_order: img.display_order }).eq("id", img.id),
        ),
      )
      setSuccess("Image order updated")
      setTimeout(() => setSuccess(null), 2000)
      setHasUnsavedChanges(true) // Mark as unsaved changes after reordering
    } catch (err) {
      setError("Failed to update image order")
    }

    setDraggedIndex(null)
  }

  const handleUpdateImageAlt = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .update({ alt_text: tempAltText || null })
        .eq("id", imageId)

      if (error) throw error

      setImages(images.map((img) => (img.id === imageId ? { ...img, alt_text: tempAltText || null } : img)))
      setEditingImageAlt(null)
      setSuccess("Alt text updated successfully")
      setTimeout(() => setSuccess(null), 3000)
      setHasUnsavedChanges(true) // Mark as unsaved changes after alt text update
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alt text")
    }
  }

  const handleUpdateImageColor = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .update({
          color_name: tempColorName || null,
          color_hex: tempColorHex || null,
        })
        .eq("id", imageId)

      if (error) throw error

      // Update local state
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, color_name: tempColorName, color_hex: tempColorHex } : img)),
      )

      setEditingImageColor(null)
      setSuccess("Color updated successfully. Make sure to sync this color with variants below.")
      setTimeout(() => setSuccess(null), 5000)
      setHasUnsavedChanges(true) // Mark as unsaved changes after color update
    } catch (err) {
      console.error("Error updating image color:", err)
      setError(err instanceof Error ? err.message : "Failed to update color")
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("[v0] Starting product update for:", product.id)

      if (!formData.brand?.trim() || !formData.model?.trim() || !formData.color?.trim()) {
        throw new Error("Brand, Model, and Color are required fields")
      }

      if (!formData.category) {
        throw new Error("Category is required")
      }

      const uniqueSlug = await ensureUniqueSlug(supabase, formData.slug, product.id)

      if (uniqueSlug !== formData.slug) {
        // Slug was modified for uniqueness, update formData
        setFormData((prev) => ({ ...prev, slug: uniqueSlug }))
        setProduct((prev) => ({ ...prev, slug: uniqueSlug }))
      }

      // All advanced attribute fields are now optional
      // Users can save products with empty advanced attributes

      const { data: updateData, error: updateError } = await supabase
        .from("products")
        .update({
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          name: formData.name,
          description: formData.description,
          price: formData.price,
        // Add retail_price to the update payload
        retail_price: formData.retail_price,
        discounted_price: formData.discounted_price ?? null,
        category: formData.category,
        sub_category: formData.sub_category || null,
        material: formData.material,
        style_type: formData.style_type,
        color_filter: formData.color_filter || null,
          slug: uniqueSlug,
          status: formData.status,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          product_details: formData.product_details,
          size_and_fit: formData.size_and_fit,
          materials_and_care: formData.materials_and_care,
          our_commitment: formData.our_commitment,
          seo_keywords: formData.seo_keywords,
          is_bestseller: formData.is_bestseller,
          is_new_in: formData.is_new_in,
          updated_at: new Date().toISOString(),
          fit_profile: formData.fit_profile || null,
          sizing_recommendation: formData.sizing_recommendation || null,
          weight_feel: formData.weight_feel || null,
          seasonality: formData.seasonality.length > 0 ? formData.seasonality : null,
          silhouette: formData.silhouette || null,
          closure_type: formData.closure_type || null,
          lining_type: formData.lining_type || null,
          dimension_width_cm: formData.dimension_width_cm || null,
          dimension_height_cm: formData.dimension_height_cm || null,
          dimension_depth_cm: formData.dimension_depth_cm || null,
          capacity_type: formData.capacity_type || null,
          carry_style: formData.carry_style || null,
          size_mm: formData.size_mm || null,
          length_cm: formData.length_cm || null,
          fastening_type: formData.fastening_type || null,
          statement_level: formData.statement_level || null,
          drop_context: formData.drop_context || null,
          parent_product_name: formData.parent_product_name.trim() || null,
          gender: formData.gender || null, // Update gender
          heel_height_cm: formData.heel_height_cm || null,
          replication_accuracy: formData.replication_accuracy || null,
          use_cloudflare_images: useCloudflare, // Save toggle state
        })
        .eq("id", product.id)
        .select()
        .single()

      if (updateError) throw updateError

      // First, fetch existing category assignments with their sort_order
      const { data: existingAssignments } = await supabase
        .from("product_categories")
        .select("category_id, sort_order")
        .eq("product_id", product.id)

      // Create a map of category_id -> sort_order for existing assignments
      const sortOrderMap = new Map(existingAssignments?.map((a) => [a.category_id, a.sort_order]) || [])

      // Determine which categories to add and which to remove
      const existingCategoryIds = new Set(existingAssignments?.map((a) => a.category_id) || [])
      const newCategoryIds = new Set(selectedCategories)

      const categoriesToAdd = [...newCategoryIds].filter((id) => !existingCategoryIds.has(id))
      const categoriesToRemove = [...existingCategoryIds].filter((id) => !newCategoryIds.has(id))

      // Delete removed category assignments
      if (categoriesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_categories")
          .delete()
          .eq("product_id", product.id)
          .in("category_id", categoriesToRemove)

        if (deleteError) {
          console.error("[v0] Error deleting category assignments:", deleteError)
          throw deleteError
        }
        console.log("[v0] Removed", categoriesToRemove.length, "category assignments")
      }

      // Insert new category assignments (they will get sort_order on next save in admin)
      if (categoriesToAdd.length > 0) {
        const { error: insertError } = await supabase.from("product_categories").insert(
          categoriesToAdd.map((categoryId) => ({
            product_id: product.id,
            category_id: categoryId,
            // New assignments get a high sort_order so they appear at the end
            sort_order: 999999,
          })),
        )

        if (insertError) {
          console.error("[v0] Error inserting category assignments:", insertError)
          throw insertError
        }
        console.log("[v0] Added", categoriesToAdd.length, "category assignments")
      }

      console.log("[v0] Category assignments updated while preserving sort_order")

      const existingVariants = variants.filter((v) => !v.id.startsWith("temp-"))
      const newVariants = variants.filter((v) => v.id.startsWith("temp-"))

      console.log("[v0] Variants to update:", existingVariants.length)
      console.log("[v0] Variants to insert:", newVariants.length)

      if (existingVariants.length > 0) {
        const updatePromises = existingVariants.map(async (variant) => {
          const { data, error } = await supabase
            .from("product_variants")
            .update({
              size: variant.size || null,
              color: variant.color || null,
              stock_quantity: variant.stock_quantity,
              price_adjustment: variant.price_adjustment,
              sku: variant.sku,
            })
            .eq("id", variant.id)
            .select()

          if (error) {
            console.error("[v0] Error updating variant:", variant.id, error)
            throw new Error(`Failed to update variant ${variant.sku}: ${error.message}`)
          }

          if (!data || data.length === 0) {
            throw new Error(`Variant ${variant.sku} update returned no data`)
          }

          console.log("[v0] Updated variant:", variant.id)
          return data
        })

        await Promise.all(updatePromises)
        console.log("[v0] All existing variants updated successfully")
      }

      if (newVariants.length > 0) {
        console.log(
          "[v0] Inserting new variants:",
          newVariants.map((v) => ({ sku: v.sku, color: v.color, size: v.size })),
        )

        const { data: insertedVariants, error: insertError } = await supabase
          .from("product_variants")
          .insert(
            newVariants.map((variant) => ({
              product_id: product.id,
              size: variant.size || null,
              color: variant.color || null,
              stock_quantity: variant.stock_quantity,
              price_adjustment: variant.price_adjustment,
              sku: variant.sku,
            })),
          )
          .select()

        if (insertError) {
          console.error("[v0] Variant insert error:", insertError)
          throw new Error(`Failed to create new variants: ${insertError.message}`)
        }

        if (!insertedVariants || insertedVariants.length !== newVariants.length) {
          throw new Error(
            `Expected ${newVariants.length} variants to be created, but got ${insertedVariants?.length || 0}`,
          )
        }

        console.log("[v0] Successfully inserted", insertedVariants.length, "new variants")

        const { data: verifyVariants, error: verifyError } = await supabase
          .from("product_variants")
          .select("id, sku, color, size")
          .eq("product_id", product.id)

        if (verifyError) {
          console.error("[v0] Variant verification error:", verifyError)
        } else {
          console.log("[v0] Verified total variants in database:", verifyVariants?.length || 0)
          console.log("[v0] Variant SKUs:", verifyVariants?.map((v) => v.sku).join(", "))
        }
      }

      // Update product videos
      if (videos.length > 0) {
        // Check if any videos were actually uploaded and inserted
        const insertedVideoIds = videos.filter((v) => !v.id.startsWith("temp-")).map((v) => v.id)
        const newVideos = videos.filter((v) => v.id.startsWith("temp-"))

        if (newVideos.length > 0) {
          console.log("[v0] Inserting", newVideos.length, "new videos")
          const { error: videoInsertError } = await supabase.from("product_videos").insert(
            newVideos.map((video) => ({
              product_id: product.id,
              video_url: video.video_url,
              display_order: video.display_order,
            })),
          )
          if (videoInsertError) {
            console.error("[v0] Video insert error:", videoInsertError)
            throw new Error(`Failed to create new videos: ${videoInsertError.message}`)
          }
          console.log("[v0] Successfully inserted", newVideos.length, "new videos")
        }
      }

      setSuccess("Product updated successfully!")
      router.refresh()
      setHasUnsavedChanges(false) // Reset unsaved changes flag on successful save
    } catch (err) {
      console.error("[v0] Submit error:", err)
      setError(err instanceof Error ? err.message : "Failed to update product. Check console for details.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        sku: `${product.slug}-${Date.now()}`,
        size: null,
        color: null,
        stock_quantity: 15, // Set default stock quantity to 15 instead of 0
        price_adjustment: 0,
      },
    ])
    setHasUnsavedChanges(true)
  }

  // Update variant
  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
    setHasUnsavedChanges(true)
  }

  // Delete variant
  const handleDeleteVariant = async (index: number, variantId: string) => {
    if (!variantId.startsWith("temp-")) {
      try {
        await supabase.from("product_variants").delete().eq("id", variantId)
      } catch (err) {
        setError("Failed to delete variant")
        return
      }
    }

    const updatedVariants = variants.filter((_, i) => i !== index)
    setVariants(updatedVariants)
    setHasUnsavedChanges(true)
  }

  // Removed AI Image Generation Functions

  const handleDeleteProduct = async () => {
    const confirmed = confirm(
      `Are you sure you want to permanently delete "${product.name}"? This will delete all product images, variants, and cannot be undone.`,
    )

    if (!confirmed) return

    setDeleting(true)
    setError(null)

    try {
      console.log("[v0] Starting product deletion process")

      // Delete all product images from storage and database
      for (const image of images) {
        const urlParts = image.url.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `products/${fileName}`

        // Delete from storage
        await supabase.storage.from("product-images").remove([filePath])
        console.log("[v0] Deleted image from storage:", filePath)
      }

      // Delete all product videos from storage and database
      for (const video of videos) {
        const urlParts = video.video_url.split("/products/videos/")
        if (urlParts.length === 2) {
          const filePath = `products/videos/${urlParts[1]}`
          await supabase.storage.from("product-images").remove([filePath])
          console.log("[v0] Deleted video from storage:", filePath)
        }
      }

      // Delete product from database (this will cascade delete images and variants due to foreign key constraints)
      const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id)

      if (deleteError) {
        console.error("[v0] Product deletion error:", deleteError)
        throw deleteError
      }

      console.log("[v0] Product deleted successfully")
      setSuccess("Product deleted successfully!")

      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push("/admin/products")
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error("[v0] Delete product error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete product")
      setDeleting(false)
    }
  }

  const handleGenerateDescription = async () => {
    setAiDescriptionGenerating(true)
    setError(null)

    try {
      console.log("[v0] Generating paragraph with:", {
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        category: formData.category,
      })

      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          category: formData.category,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.log("[v0] API error:", data)
        throw new Error(data.error || "Failed to generate paragraph")
      }

      const data = await response.json()
      console.log("[v0] API response:", data)
      console.log("[v0] Generated description:", data.description)

      if (data.description) {
        // Split existing description into paragraphs
        const currentDescription = formData.description || ""
        console.log("[v0] Current description:", currentDescription)
        const paragraphs = currentDescription.split(/\n\n+/).filter((p) => p.trim())
        console.log("[v0] Existing paragraphs:", paragraphs)

        // Replace first paragraph with AI-generated one, keep rest
        const newParagraphs = [data.description, ...paragraphs.slice(1)]
        const newDescription = newParagraphs.join("\n\n")
        console.log("[v0] New description:", newDescription)

        setFormData({ ...formData, description: newDescription })
        setProduct({ ...product, description: newDescription }) // Update product state too
        console.log("[v0] FormData updated with new description")
        setSuccess("Paragraph 1 generated successfully!")
        setTimeout(() => setSuccess(null), 3000)
        setHasUnsavedChanges(true) // Mark as unsaved changes after description generation
      }
    } catch (err) {
      console.error("[v0] AI paragraph error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate paragraph")
    } finally {
      setAiDescriptionGenerating(false)
    }
  }

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
    setHasUnsavedChanges(true) // Mark as unsaved changes when categories are changed
  }

  const renderCategoryOptions = () => {
    const mainCategories = categories.filter((c) => !c.parent_id)
    const options: React.ReactElement[] = []

    const searchTerm = categorySearch.toLowerCase().trim()

    mainCategories.forEach((main) => {
      const subcategories = categories.filter((c) => c.parent_id === main.id)

      // Check if main category or any subcategory matches the search
      const mainMatches = !searchTerm || main.name.toLowerCase().includes(searchTerm)
      const hasMatchingSubcategory = subcategories.some((sub) => sub.name.toLowerCase().includes(searchTerm))

      // Show main category if it matches or has matching subcategories
      if (mainMatches || hasMatchingSubcategory) {
        const isSelected = selectedCategories.has(main.id)
        options.push(
          <label
            key={main.id}
            className="flex items-center gap-3 p-3 border border-zinc-200 rounded hover:bg-zinc-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCategorySelection(main.id)}
              className="w-5 h-5 border-2 border-zinc-300 rounded"
            />
            <span className="font-semibold text-sm">{main.name}</span>
          </label>,
        )

        // Show subcategories that match the search
        subcategories.forEach((sub) => {
          const subMatches = !searchTerm || sub.name.toLowerCase().includes(searchTerm)
          if (subMatches) {
            const isSubSelected = selectedCategories.has(sub.id)
            options.push(
              <label
                key={sub.id}
                className="flex items-center gap-3 p-3 border border-zinc-200 rounded hover:bg-zinc-50 cursor-pointer ml-6"
              >
                <input
                  type="checkbox"
                  checked={isSubSelected}
                  onChange={() => toggleCategorySelection(sub.id)}
                  className="w-5 h-5 border-2 border-zinc-300 rounded"
                />
                <span className="text-sm">└─ {sub.name}</span>
              </label>,
            )
          }
        })
      }
    })

    return options
  }

  const handleGenerateSizeFit = async () => {
    // Check if size_and_fit already has content
    if (formData.size_and_fit && formData.size_and_fit.trim() !== "") {
      setShowSizeFitReplaceDialog(true)
      return
    }

    // Generate if empty
    await performSizeFitGeneration(false)
  }

  const performSizeFitGeneration = async (append: boolean) => {
    setIsGeneratingSizeFit(true)
    try {
      const result = await generateSizeFit({ productId: product.id }) // Pass product.id

      if (!result.success) {
        if (result.missingFields && result.missingFields.length > 0) {
          toast("Missing Required Fields", {
            description: `Please fill in: ${result.missingFields.join(", ")}`,
            action: {
              label: "Dismiss",
              onClick: () => {},
            },
            duration: 5000,
            variant: "destructive",
          })
        } else {
          toast("Generation Failed", {
            description: result.error || "Could not generate Size & Fit text",
            action: {
              label: "Dismiss",
              onClick: () => {},
            },
            duration: 5000,
            variant: "destructive",
          })
        }
        return
      }

      if (result.sizeFitText) {
        let newContent = result.sizeFitText

        if (append && formData.size_and_fit) {
          newContent = formData.size_and_fit + "\n\n" + result.sizeFitText
        }

        handleInputChange("size_and_fit", newContent)

        toast("Size & Fit Generated", {
          description: "Text has been generated from product attributes. Review before saving.",
          duration: 3000,
        })
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to generate Size & Fit text",
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
        duration: 5000,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSizeFit(false)
      setShowSizeFitReplaceDialog(false)
      setPendingSizeFitText("")
    }
  }

  const handleSizeFitReplaceConfirm = async (action: "replace" | "append" | "cancel") => {
    if (action === "cancel") {
      setShowSizeFitReplaceDialog(false)
      return
    }

    if (action === "replace") {
      await performSizeFitGeneration(false)
    } else if (action === "append") {
      await performSizeFitGeneration(true)
    }
  }

  useEffect(() => {
    const hasChanges =
      formData.name !== initialProduct.name ||
      formData.slug !== initialProduct.slug ||
      formData.price !== initialProduct.price ||
      formData.description !== initialProduct.description ||
      formData.product_details !== initialProduct.product_details ||
      formData.size_and_fit !== initialProduct.size_and_fit ||
      formData.materials_and_care !== initialProduct.materials_and_care ||
      formData.our_commitment !== initialProduct.our_commitment ||
      formData.seo_keywords !== initialProduct.seo_keywords ||
      // Added meta_title to the check for unsaved changes
      formData.meta_title !== initialProduct.meta_title ||
      // Added meta_description to the check for unsaved changes
      formData.meta_description !== initialProduct.meta_description ||
      formData.status !== initialProduct.status ||
      formData.is_bestseller !== initialProduct.is_bestseller || // Check bestseller status
      formData.is_new_in !== initialProduct.is_new_in || // Check new in status
      // Added check for brand, model, color changes
      formData.brand !== initialProduct.brand ||
      formData.model !== initialProduct.model ||
      formData.color !== initialProduct.color ||
      // Added check for material and style_type changes
      formData.material !== initialProduct.material ||
      formData.style_type !== initialProduct.style_type ||
  // Added check for retail_price changes
  formData.retail_price !== initialProduct.retail_price ||
  // Check for discounted_price changes
  (formData.discounted_price ?? null) !== (initialProduct.discounted_price ?? null) ||
      // Check for changes in selected categories
      selectedCategories.size !== (initialProduct.product_categories?.length ?? 0) ||
      // A more robust check for category changes would compare the sets directly
      Array.from(selectedCategories).some(
        (catId) => !initialProduct.product_categories?.some((pc) => pc.category_id === catId),
      ) ||
      (initialProduct.product_categories?.some((pc) => !selectedCategories.has(pc.category_id)) ?? false) ||
      images.length !== initialProduct.product_images.length || // Rough check for images
      variants.length !== initialProduct.product_variants.length || // Rough check for variants
      // Check advanced attributes for changes
      formData.fit_profile !== initialProduct.fit_profile ||
      formData.sizing_recommendation !== initialProduct.sizing_recommendation ||
      formData.weight_feel !== initialProduct.weight_feel ||
      JSON.stringify(formData.seasonality) !== JSON.stringify(initialProduct.seasonality) ||
      formData.silhouette !== initialProduct.silhouette ||
      formData.closure_type !== initialProduct.closure_type ||
      formData.lining_type !== initialProduct.lining_type ||
      formData.dimension_width_cm !== initialProduct.dimension_width_cm ||
      formData.dimension_height_cm !== initialProduct.dimension_height_cm ||
      formData.dimension_depth_cm !== initialProduct.dimension_depth_cm ||
      formData.capacity_type !== initialProduct.capacity_type ||
      formData.carry_style !== initialProduct.carry_style ||
      formData.size_mm !== initialProduct.size_mm ||
      formData.length_cm !== initialProduct.length_cm ||
      formData.fastening_type !== initialProduct.fastening_type ||
      formData.statement_level !== initialProduct.statement_level ||
      formData.drop_context !== initialProduct.drop_context ||
      // Check for parent product ID changes
      formData.parent_product_name !== initialProduct.parent_product_name ||
      // Check for gender changes
      formData.gender !== initialProduct.gender ||
      // Check for Cloudflare toggle changes
      useCloudflare !== (initialProduct.use_cloudflare_images || false)

    // More thorough check for images and variants might be needed if order/content matters
    setHasUnsavedChanges(hasChanges)
  }, [formData, initialProduct, images, variants, selectedCategories, useCloudflare])

  // Fetch initial images data
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true })

      if (data && !error) {
        setImages(data)
      } else if (error) {
        console.error("Error fetching images:", error)
      }
    }
    fetchImages()
  }, [product.id])

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("product_videos")
        .select("*")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true })

      if (data && !error) {
        setVideos(data)
      } else if (error) {
        console.error("Error fetching videos:", error)
      }
    }

    fetchVideos()
  }, [product.id])

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to upload videos")
      }

      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Validate file type
        if (!file.type.startsWith("video/")) {
          throw new Error(`${file.name} is not a video file. Please select only video files.`)
        }

        // Validate file size (50MB max for videos)
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
          throw new Error(`${file.name} is ${sizeMB}MB. Videos must be less than 50MB.`)
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${product.id}_video_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `products/videos/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath)

        // Insert into product_videos table
        const { data: videoData, error: videoError } = await supabase
          .from("product_videos")
          .insert({
            product_id: product.id,
            video_url: publicUrl,
            display_order: videos.length + index,
          })
          .select()
          .single()

        if (videoError) {
          await supabase.storage.from("product-images").remove([filePath])
          throw new Error(`Failed to save ${file.name} to database: ${videoError.message}`)
        }

        return videoData
      })

      const newVideos = await Promise.all(uploadPromises)
      setVideos([...videos, ...newVideos])
      setSuccess(`Successfully uploaded ${newVideos.length} video(s)`)
      setTimeout(() => setSuccess(null), 3000)
      setHasUnsavedChanges(true)
    } catch (err) {
      console.error("[v0] Video upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload videos")
    } finally {
      setUploading(false)
      if (videoInputRef.current) {
        videoInputRef.current.value = ""
      }
    }
  }

  // Video deletion handler
  const handleDeleteVideo = async (videoId: string, videoUrl: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      // Extract file path from URL
      const urlParts = videoUrl.split("/products/videos/")
      if (urlParts.length === 2) {
        const filePath = `products/videos/${urlParts[1]}`
        await supabase.storage.from("product-images").remove([filePath])
      }

      // Delete from database
      const { error } = await supabase.from("product_videos").delete().eq("id", videoId)

      if (error) throw error

      setVideos(videos.filter((v) => v.id !== videoId))
      setSuccess("Video deleted successfully")
      setTimeout(() => setSuccess(null), 3000)
      setHasUnsavedChanges(true)
    } catch (err) {
      console.error("[v0] Error deleting video:", err)
      setError("Failed to delete video")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Identity Section */}
        <ProductIdentity
          formData={formData}
          slugManuallyEdited={slugManuallyEdited}
          onBrandModelColorChange={handleBrandModelColorChange}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          onResetSlug={handleResetSlug}
          onInputChange={handleInputChange}
        />

        {/* Product Attributes & Advanced Attributes Section */}
        <ProductAttributes
          formData={formData}
          onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
          onInputChange={handleInputChange}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />

        {/* Browsing Categories Section */}
        <ProductCategories
          categories={categories}
          selectedCategories={selectedCategories}
          categorySearch={categorySearch}
          onCategorySearchChange={setCategorySearch}
          onToggleCategory={toggleCategorySelection}
        />

        {/* Product Status Section */}
        <ProductStatus status={formData.status} onStatusChange={(status) => handleInputChange("status", status)} />

        {/* Product Badges Section */}
        <ProductBadges
          isBestseller={formData.is_bestseller}
          isNewIn={formData.is_new_in}
          onBestsellerChange={(checked) => handleInputChange("is_bestseller", checked)}
          onNewInChange={(checked) => handleInputChange("is_new_in", checked)}
        />

        {/* Description & Expandable Product Sections */}
        <ProductDescription
          formData={formData}
          aiDescriptionGenerating={aiDescriptionGenerating}
          isGeneratingSizeFit={isGeneratingSizeFit}
          onInputChange={handleInputChange}
          onGenerateDescription={handleGenerateDescription}
          onGenerateSizeFit={handleGenerateSizeFit}
        />

        {/* <div className="border border-zinc-200 rounded-md p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium tracking-wide uppercase text-zinc-900">PRODUCT IMAGES</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 border border-black rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors hover:bg-black hover:text-white disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Add Images"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-300 rounded-md py-8 text-center">
              <Upload className="mx-auto mb-3 text-zinc-400" size={32} />
              <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                No images yet. Click "Add Images" to upload.
              </p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto pr-2">
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className="border border-zinc-200 rounded-md bg-white cursor-move hover:border-black transition-colors"
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt_text || formData.name}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-md">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id, image.url)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1.5 rounded-md transition-opacity hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="absolute top-1.5 left-1.5 bg-black text-white px-1.5 py-0.5 text-xs font-medium rounded">
                          {index + 1}
                        </div>
                        <div className="absolute top-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-1.5">
                      {editingImageAlt === image.id ? (
                        <div className="space-y-1.5 p-2 border border-zinc-200 rounded-md bg-zinc-50">
                          <textarea
                            placeholder="Balenciaga Speed 2.0 Lace-Up Black Sole – premium front view with AA+ craftsmanship"
                            value={tempAltText}
                            onChange={(e) => setTempAltText(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 border border-zinc-300 rounded-md resize-none"
                            rows={3}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateImageAlt(image.id)}
                              className="flex-1 h-6 text-xs bg-black hover:bg-zinc-800 rounded-md"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImageAlt(null)}
                              className="flex-1 h-6 text-xs border-zinc-300 rounded-md"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingImageAlt(image.id)
                            setTempAltText(image.alt_text || "")
                          }}
                          className="w-full text-left text-[10px] text-zinc-600 hover:text-black transition-colors px-1.5 py-1 rounded hover:bg-zinc-50"
                        >
                          {image.alt_text ? (
                            <span className="line-clamp-2">{image.alt_text}</span>
                          ) : (
                            <span className="italic text-zinc-400">Add Alt Text (SEO)</span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5">
                      {editingImageColor === image.id ? (
                        <div className="space-y-1.5 p-2 border border-zinc-200 rounded-md bg-zinc-50">
                          <Input
                            placeholder="Color name"
                            value={tempColorName}
                            onChange={(e) => setTempColorName(e.target.value)}
                            className="text-xs h-7 border-zinc-300 rounded-md"
                          />
                          <div className="flex gap-1.5 items-center">
                            <Input
                              type="color"
                              value={tempColorHex}
                              onChange={(e) => setTempColorHex(e.target.value)}
                              className="w-10 h-7 p-0.5 cursor-pointer border-zinc-300 rounded-md"
                            />
                            <Input
                              type="text"
                              value={tempColorHex}
                              onChange={(e) => setTempColorHex(e.target.value)}
                              placeholder="#000000"
                              className="text-xs flex-1 h-7 border-zinc-300 rounded-md"
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateImageColor(image.id)}
                              className="flex-1 h-6 text-xs bg-black hover:bg-zinc-800 rounded-md"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImageColor(null)}
                              className="flex-1 h-6 text-xs border-zinc-300 rounded-md"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingImageColor(image.id)
                            setTempColorName(image.color_name || "")
                            setTempColorHex(image.color_hex || "#000000")
                          }}
                          className="w-full text-left p-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors text-xs"
                        >
                          {image.color_name ? (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-3 h-3 rounded border border-zinc-300 flex-shrink-0"
                                style={{ backgroundColor: image.color_hex || "#000000" }}
                              />
                              <span className="text-xs font-medium truncate">{image.color_name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 font-medium">+ Assign color</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs font-medium text-zinc-500">
            Drag and drop images to reorder. The first image will be the main product image.
          </p>
        </div> */}

        {/* Legacy PRODUCT IMAGES section stays here unchanged */}
        <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">Product Images</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 hover:bg-white/[0.07] hover:text-white/90 transition-all disabled:opacity-40"
              >
                <Upload size={12} />
                {uploading ? "Uploading..." : "Add Images"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {images.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
              <Upload className="mx-auto mb-3 text-white/20" size={28} />
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
                No images yet. Click "Add Images" to upload.
              </p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto pr-2">
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className="rounded-xl border border-white/8 bg-white/[0.02] cursor-move hover:border-white/20 transition-colors overflow-hidden"
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt_text || formData.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id, image.url)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500/80 text-white p-1.5 rounded-lg transition-opacity hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="absolute top-1.5 left-1.5 rounded-lg bg-black/70 text-white px-1.5 py-0.5 font-sans text-[9px] font-medium">
                          {index + 1}
                        </div>
                        <div className="absolute top-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-1.5">
                      {editingImageAlt === image.id ? (
                        <div className="space-y-1.5 p-2 rounded-xl border border-white/8 bg-white/[0.03]">
                          <textarea
                            placeholder="Balenciaga Speed 2.0 – premium front view with AA+ craftsmanship"
                            value={tempAltText}
                            onChange={(e) => setTempAltText(e.target.value)}
                            className="w-full text-[10px] px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 placeholder-white/20 resize-none focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateImageAlt(image.id)}
                              className="flex-1 h-6 text-[10px] bg-white/90 text-black hover:bg-white rounded-lg"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImageAlt(null)}
                              className="flex-1 h-6 text-[10px] border-white/10 bg-transparent text-white/50 hover:bg-white/[0.07] rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingImageAlt(image.id)
                            setTempAltText(image.alt_text || "")
                          }}
                          className="w-full text-left text-[10px] text-white/30 hover:text-white/60 transition-colors px-1.5 py-1 rounded-lg hover:bg-white/[0.03]"
                        >
                          {image.alt_text ? (
                            <span className="line-clamp-2">{image.alt_text}</span>
                          ) : (
                            <span className="italic text-white/20">Add Alt Text (SEO)</span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5">
                      {editingImageColor === image.id ? (
                        <div className="space-y-1.5 p-2 rounded-xl border border-white/8 bg-white/[0.03]">
                          <Input
                            placeholder="Color name"
                            value={tempColorName}
                            onChange={(e) => setTempColorName(e.target.value)}
                            className="text-[10px] h-7 border-white/10 bg-white/[0.03] text-white/70 rounded-lg"
                          />
                          <div className="flex gap-1.5 items-center">
                            <Input
                              type="color"
                              value={tempColorHex}
                              onChange={(e) => setTempColorHex(e.target.value)}
                              className="w-10 h-7 p-0.5 cursor-pointer border-white/10 rounded-lg"
                            />
                            <Input
                              type="text"
                              value={tempColorHex}
                              onChange={(e) => setTempColorHex(e.target.value)}
                              placeholder="#000000"
                              className="text-[10px] flex-1 h-7 border-white/10 bg-white/[0.03] text-white/70 rounded-lg"
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateImageColor(image.id)}
                              className="flex-1 h-6 text-[10px] bg-white/90 text-black hover:bg-white rounded-lg"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImageColor(null)}
                              className="flex-1 h-6 text-[10px] border-white/10 bg-transparent text-white/50 hover:bg-white/[0.07] rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingImageColor(image.id)
                            setTempColorName(image.color_name || "")
                            setTempColorHex(image.color_hex || "#000000")
                          }}
                          className="w-full text-left p-1.5 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-[10px]"
                        >
                          {image.color_name ? (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                                style={{ backgroundColor: image.color_hex || "#000000" }}
                              />
                              <span className="text-[10px] font-medium text-white/60 truncate">{image.color_name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/25">+ Assign color</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 font-sans text-[9px] text-white/25">
            Drag and drop images to reorder. The first image will be the main product image.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-1">Cloudflare Images (V2)</h2>
              <p className="font-sans text-[9px] text-white/25">
                Migrate to Cloudflare for faster CDN delivery with optimized variants
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">Use for this product</span>
              <input
                type="checkbox"
                checked={useCloudflare}
                onChange={(e) => {
                  setUseCloudflare(e.target.checked)
                  setHasUnsavedChanges(true)
                }}
                className="w-4 h-4 rounded accent-white cursor-pointer"
              />
            </label>
          </div>
          <CloudflareImagesSection
            productId={product.id}
            initialImages={cfImages}
            onUpdate={() => {
              // Refresh page or refetch data
              router.refresh()
            }}
          />
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#131313] p-6">
          <CategoryImagesSection
            productId={product.id}
            initialImages={categoryImages}
            onUpdate={() => {
              router.refresh()
            }}
          />
        </div>

        <ProductVideos
          videos={videos}
          uploading={uploading}
          videoInputRef={videoInputRef}
          onVideoUpload={handleVideoUpload}
          onDeleteVideo={handleDeleteVideo}
          onAddVideoClick={() => videoInputRef.current?.click()}
        />

        <FactoryMediaManager
          productId={product.id}
          initialMedia={factoryMedia}
          onUpdate={() => router.refresh()}
        />

        {/* Product Variants Section */}
        <ProductVariants
          variants={variants}
          availableColors={availableColors}
          productSlug={product.slug}
          onAddVariant={handleAddVariant}
          onUpdateVariant={handleUpdateVariant}
          onDeleteVariant={handleDeleteVariant}
          onGenerateVariants={(config) => {
            const sizesByType = {
              jacket: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
              shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
              belts: ["80", "85", "90", "95", "100", "105", "110"],
              accessories: ["ONE SIZE"],
              custom: config.customSizes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }

            const sizes = sizesByType[config.productType]

            // Get colors from images if includeColors is true
            const colors =
              config.includeColors && config.availableColors.length > 0
                ? config.availableColors.map((c) => ({ name: c.name, hex: c.hex }))
                : [{ name: null, hex: null }]

            // Generate all combinations of size × color
            const newVariants: ProductVariant[] = []

            for (const size of sizes) {
              for (const color of colors) {
                // Create unique SKU: product-slug-COLOR-SIZE
                const colorCode = color.name ? color.name.toUpperCase().substring(0, 3) : ""
                const sizeCode = size.replace(/\s+/g, "").toUpperCase()
                const sku = `${product.slug.toUpperCase()}-${colorCode}${colorCode ? "-" : ""}${sizeCode}-${Date.now().toString().slice(-4)}`

                newVariants.push({
                  id: `temp-${Date.now()}-${size}-${color.name || "default"}`,
                  sku: sku,
                  size: sizes.length === 1 && size === "ONE SIZE" ? null : size,
                  color: color.name,
                  stock_quantity: 15,
                  price_adjustment: 0,
                } as ProductVariant)
              }
            }

            // Replace existing variants with generated ones
            setVariants(newVariants)
            setSuccess(`Generated ${newVariants.length} variants! Review and adjust stock quantities, then save.`)
            setTimeout(() => setSuccess(null), 5000)
            setHasUnsavedChanges(true)
          }}
        />

        {error && <ToastNotification message={error} type="error" onClose={() => setError(null)} />}
        {success && <ToastNotification message={success} type="success" onClose={() => setSuccess(null)} />}

        <div className="sticky bottom-0 rounded-2xl border border-white/8 bg-[#131313] -mx-8 px-8 py-4 flex items-center justify-between">
          <div className="font-sans text-[9px] text-white/30">
            {product.updated_at && `Last updated ${new Date(product.updated_at).toLocaleDateString()}`}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/35 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 text-black px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] hover:bg-white transition-all disabled:opacity-50"
            >
              <Save size={13} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 mt-2">
          <h3 className="font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-red-400/70 mb-2">Danger Zone</h3>
          <p className="font-sans text-[9px] text-white/25 mb-4">
            Deleting this product is permanent and cannot be undone. All product images, variants, and data will be
            permanently removed.
          </p>
          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={deleting || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 text-red-400 px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={13} />
            {deleting ? "Deleting..." : "Delete Product Permanently"}
          </button>
        </div>
      </form>

      {/* Size & Fit Replace/Append Dialog */}
      <Dialog open={showSizeFitReplaceDialog} onOpenChange={setShowSizeFitReplaceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Size & Fit Already Exists</DialogTitle>
            <DialogDescription>
              This product already has Size & Fit text. Would you like to replace it or append the new text?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => handleSizeFitReplaceConfirm("replace")} variant="default" className="w-full">
              Replace Existing Text
            </Button>
            <Button onClick={() => handleSizeFitReplaceConfirm("append")} variant="outline" className="w-full">
              Append to Existing Text
            </Button>
            <Button onClick={() => handleSizeFitReplaceConfirm("cancel")} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </>
  )
}
