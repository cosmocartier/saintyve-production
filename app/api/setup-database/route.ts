import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create products table
    const { error: productsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          category TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access" ON products;
        CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
      `,
    })

    if (productsError) {
      console.error("[v0] Products table error:", productsError)
    }

    // Create product_images table
    const { error: imagesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS product_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          alt_text TEXT,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

        ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access" ON product_images;
        CREATE POLICY "Allow public read access" ON product_images FOR SELECT USING (true);
      `,
    })

    if (imagesError) {
      console.error("[v0] Images table error:", imagesError)
    }

    // Create product_variants table
    const { error: variantsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS product_variants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          size TEXT,
          color TEXT,
          sku TEXT UNIQUE NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          price_adjustment DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

        ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access" ON product_variants;
        CREATE POLICY "Allow public read access" ON product_variants FOR SELECT USING (true);
      `,
    })

    if (variantsError) {
      console.error("[v0] Variants table error:", variantsError)
    }

    // Seed products
    const products = [
      {
        slug: "nike-zoomx-vomero-plus",
        name: "Nike ZoomX Vomero Plus",
        description: "Premium running shoes with ZoomX foam technology for maximum comfort and performance.",
        price: 180.0,
        category: "Footwear",
      },
      {
        slug: "nike-cap",
        name: "Nike Cap",
        description: "Classic Nike cap with adjustable strap and breathable fabric.",
        price: 35.0,
        category: "Accessories",
      },
      {
        slug: "nike-tech-fleece-set",
        name: "Nike Tech Fleece Set",
        description: "Complete tech fleece set including hoodie and joggers for ultimate comfort.",
        price: 220.0,
        category: "Apparel",
      },
      {
        slug: "jordan-hoodie",
        name: "Jordan Hoodie",
        description: "Premium Jordan brand hoodie with iconic Jumpman logo.",
        price: 95.0,
        category: "Apparel",
      },
    ]

    for (const product of products) {
      const { data: existingProduct } = await supabase.from("products").select("id").eq("slug", product.slug).single()

      if (!existingProduct) {
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(product)
          .select()
          .single()

        if (insertError) {
          console.error(`[v0] Error inserting ${product.name}:`, insertError)
          continue
        }

        // Add product images
        const imageUrl = `/products/${product.slug.replace("nike-", "nike-").replace("jordan-", "jordan-")}.jpeg`
        await supabase.from("product_images").insert({
          product_id: newProduct.id,
          url: imageUrl,
          alt_text: product.name,
          display_order: 0,
        })

        // Add variants based on category
        if (product.category === "Footwear") {
          const sizes = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]
          for (const size of sizes) {
            await supabase.from("product_variants").insert({
              product_id: newProduct.id,
              size,
              sku: `${product.slug.toUpperCase()}-${size}`,
              stock_quantity: 10,
            })
          }
        } else if (product.category === "Apparel") {
          const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
          for (const size of sizes) {
            await supabase.from("product_variants").insert({
              product_id: newProduct.id,
              size,
              sku: `${product.slug.toUpperCase()}-${size}`,
              stock_quantity: 15,
            })
          }
        } else {
          await supabase.from("product_variants").insert({
            product_id: newProduct.id,
            size: "One Size",
            sku: `${product.slug.toUpperCase()}-OS`,
            stock_quantity: 20,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
    })
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
