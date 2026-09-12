import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/contexts/cart-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { PriceModeProvider } from "@/contexts/price-mode-context"
import { WishlistSidebar } from "@/components/wishlist-sidebar"
import { PinterestTag } from "@/components/pinterest-tag"
import "./globals.css"

import { Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

// TT Commons Pro Expanded — self-hosted local font, replaces the Futura CDN import
const ttCommonsProExpanded = localFont({
  src: [
    { path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-Thin.ttf", weight: "100", style: "normal" },
    {
      path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    { path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-Medium.ttf", weight: "500", style: "normal" },
    {
      path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-DemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/tt-commons-pro-expanded/TTCommonsProExpanded-ExtraBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-tt-commons",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SAINT YVE® | Designer Sneakers, Fashion & Accessories",
  description: "Shop designer sneakers, fashion, watches and accessories from a carefully selected catalog. Worldwide shipping available.",
  generator: "Saint Yve",
  applicationName: "Saint Yve",
  keywords: ["designer fashion", "luxury clothing", "premium apparel", "designer bags", "designer shoes"],
  icons: {
    icon: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={ttCommonsProExpanded.variable}>
      <body className="font-sans antialiased">
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="L3lI1q2qfQPaJEtMN8L3QA"
          strategy="afterInteractive"
        />
        <PinterestTag />
        <PriceModeProvider>
          <WishlistProvider>
            <CartProvider>
              <WishlistSidebar />
              {children}
            </CartProvider>
          </WishlistProvider>
        </PriceModeProvider>
        <Analytics />
      </body>
    </html>
  )
}
