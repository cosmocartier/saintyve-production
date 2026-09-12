"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import gsap from "gsap"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ChevronRight, Plus } from "lucide-react"
import Image from "next/image"

export function MobileMenu({ hasScrolled }: { hasScrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeFrame, setActiveFrame] = useState<"main" | "shopall" | "brands" | "men" | "women">("main")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<any[]>([])
  const [shopAllCategories, setShopAllCategories] = useState<any[]>([])
  const [brandsCategories, setBrandsCategories] = useState<any[]>([])

  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mainFrameRef = useRef<HTMLDivElement>(null)
  const shopallFrameRef = useRef<HTMLDivElement>(null)
  const brandsFrameRef = useRef<HTMLDivElement>(null)
  const menFrameRef = useRef<HTMLDivElement>(null)
  const womenFrameRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  const loadCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("display_order")

    if (data && !error) {
      setCategories(data)

      const shopAllCat = data.find((cat) => cat.slug === "shop-all" && !cat.parent_id)
      if (shopAllCat) {
        const shopAllSubs = data.filter((cat) => cat.parent_id === shopAllCat.id)
        setShopAllCategories(shopAllSubs)
      }

      const brandsCat = data.find((cat) => cat.main_category === "Brands" && !cat.parent_id)
      if (brandsCat) {
        const brandsSubs = data
          .filter((cat) => cat.parent_id === brandsCat.id)
          .sort((a, b) => a.name.localeCompare(b.name))
        setBrandsCategories(brandsSubs)
      }
    }
  }

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => {
    setIsOpen(false)
    setTimeout(() => setActiveFrame("main"), 1000)
  }

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return

    const sidebar = sidebarRef.current
    const overlay = overlayRef.current

    if (isOpen) {
      sidebar.style.pointerEvents = "auto"
      overlay.style.pointerEvents = "auto"

      gsap.to(sidebar, {
        x: "0%",
        duration: 1,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
      })

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
      })
    } else {
      gsap.to(sidebar, {
        x: "-100%",
        duration: 1,
        ease: "cubic-bezier(0.15, 1, 0.25, 1)",
        onComplete: () => {
          sidebar.style.pointerEvents = "none"
        },
      })

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          overlay.style.pointerEvents = "none"
        },
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (
      !mainFrameRef.current ||
      !shopallFrameRef.current ||
      !brandsFrameRef.current ||
      !menFrameRef.current ||
      !womenFrameRef.current
    )
      return

    const mainFrame = mainFrameRef.current
    const shopallFrame = shopallFrameRef.current
    const brandsFrame = brandsFrameRef.current
    const menFrame = menFrameRef.current
    const womenFrame = womenFrameRef.current

    if (activeFrame === "shopall") {
      gsap.to(mainFrame, { x: "-100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(shopallFrame, { x: "0%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(brandsFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(menFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(womenFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
    } else if (activeFrame === "brands") {
      gsap.to(mainFrame, { x: "-100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(shopallFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(brandsFrame, { x: "0%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(menFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(womenFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
    } else if (activeFrame === "men") {
      gsap.to(mainFrame, { x: "-100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(shopallFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(brandsFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(menFrame, { x: "0%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(womenFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
    } else if (activeFrame === "women") {
      gsap.to(mainFrame, { x: "-100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(shopallFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(brandsFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(menFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(womenFrame, { x: "0%", duration: 0.5, ease: "power2.inOut" })
    } else {
      gsap.to(mainFrame, { x: "0%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(shopallFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(brandsFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(menFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
      gsap.to(womenFrame, { x: "100%", duration: 0.5, ease: "power2.inOut" })
    }
  }, [activeFrame])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  const handleOverlayClick = () => {
    closeMenu()
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
      closeMenu()
    } else {
      router.push("/account#ai-tryon")
      closeMenu()
    }
  }

  const handleShopAllClick = () => {
    setActiveFrame("shopall")
  }

  const handleBrandsClick = () => {
    setActiveFrame("brands")
  }

  const handleMenClick = () => {
    setActiveFrame("men")
  }

  const handleWomenClick = () => {
    setActiveFrame("women")
  }

  const handleBackClick = () => {
    setActiveFrame("main")
    setExpandedCategories(new Set())
  }

  const renderCategoryFrame = (frameRef: React.RefObject<HTMLDivElement>, categories: any[], isShopAll = false) => (
    <div ref={frameRef} className="absolute inset-0 flex flex-col" style={{ transform: "translateX(100%)" }}>
      <div className="flex items-center justify-between p-[1em] border-b border-transparent">
        <button
          onClick={handleBackClick}
          className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
        >
          BACK
        </button>
        <button
          onClick={closeMenu}
          className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
        >
          CLOSE
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <nav className="flex flex-col p-[1em] overflow-y-auto">
          {isShopAll ? (
            <>
              <Link
                href="/sneakers"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                SNEAKERS
              </Link>
              <Link
                href="/bags"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                BAGS
              </Link>
              <Link
                href="/watches"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                WATCHES
              </Link>
              <Link
                href="/jackets"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                JACKETS
              </Link>
              <Link
                href="/jewelry"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                JEWELRY
              </Link>
              <Link
                href="/accessories"
                onClick={closeMenu}
                className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
              >
                ACCESSORIES
              </Link>
            </>
          ) : (
            categories.map((category) => {
              const isExpanded = expandedCategories.has(category.name)
              const hasDirectLink = category.link && category.subcategories.length === 0

              return (
                <div key={category.name}>
                  {hasDirectLink ? (
                    <Link
                      href={category.link}
                      onClick={closeMenu}
                      className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
                    >
                      {category.name}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
                      >
                        {category.name}
                        <Plus
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="flex flex-col border-b border-transparent bg-black/60 backdrop-blur-md">
                          {category.subcategories.map((subcategory: any) => {
                            const subcategorySlug =
                              typeof subcategory === "string"
                                ? subcategory.toLowerCase().replace(/\s+/g, "-")
                                : subcategory.slug
                            const baseUrl =
                              category.name.includes("MEN") || category.slug?.includes("men")
                                ? "/men-collection"
                                : "/women-collection"
                            const href =
                              typeof subcategory === "object" && subcategory.slug
                                ? `${baseUrl}/${subcategory.slug}`
                                : `${baseUrl}/${subcategorySlug}`

                            return (
                              <Link
                                key={typeof subcategory === "string" ? subcategory : subcategory.name}
                                href={href}
                                className="text-white/70 hover:text-white text-xs font-medium tracking-wider uppercase transition-colors py-5 pl-4"
                                onClick={closeMenu}
                              >
                                {typeof subcategory === "string" ? subcategory : subcategory.name}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </nav>
      </div>
    </div>
  )

  const renderBrandsFrame = (frameRef: React.RefObject<HTMLDivElement>, categories: any[]) => (
    <div ref={frameRef} className="absolute inset-0 flex flex-col" style={{ transform: "translateX(100%)" }}>
      <div className="flex items-center justify-between p-[1em] border-b border-transparent">
        <button
          onClick={handleBackClick}
          className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
        >
          BACK
        </button>
        <button
          onClick={closeMenu}
          className="cursor-pointer"
        >
          <Image src="/close-icon.png" alt="Close" width={16} height={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <nav className="flex flex-col p-[1em] overflow-y-auto divide-y divide-white/10">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/brands/${category.slug.replace(/^brands-/, "")}`}
              onClick={closeMenu}
              className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 w-full text-left"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )

  const menMenuData = [
    { name: "BAGS",        link: "/mens/bags",        subcategories: [] },
    { name: "OUTERWEAR",   link: "/mens/outerwear",   subcategories: [] },
    { name: "SHOES",       link: "/mens/shoes",       subcategories: [] },
    { name: "WATCHES",     link: "/mens/watches",     subcategories: [] },
    { name: "ACCESSORIES", link: "/mens/accessories", subcategories: [] },
  ]

  const womenMenuData = [
    { name: "BAGS",        link: "/womens/bags",        subcategories: [] },
    { name: "OUTERWEAR",   link: "/womens/outerwear",   subcategories: [] },
    { name: "SHOES",       link: "/womens/shoes",       subcategories: [] },
    { name: "ACCESSORIES", link: "/womens/accessories", subcategories: [] },
  ]

  const renderGenderFrame = (
    frameRef: React.RefObject<HTMLDivElement>,
    menuData: typeof menMenuData,
    title: string,
  ) => (
    <div ref={frameRef} className="absolute inset-0 flex flex-col" style={{ transform: "translateX(100%)" }}>
      <div className="flex items-center justify-between p-[1em] border-b border-transparent">
        <button
          onClick={handleBackClick}
          className="text-white/40 text-xs font-medium tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity"
        >
          BACK
        </button>
        <button
          onClick={closeMenu}
          className="cursor-pointer"
        >
          <Image src="/close-icon.png" alt="Close" width={16} height={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <nav className="flex flex-col p-[1em] overflow-y-auto">
          {menuData.map((category) => {
            const isExpanded = expandedCategories.has(category.name)
            const hasSubcategories = category.subcategories.length > 0

            return (
              <div key={category.name}>
                {!hasSubcategories ? (
                  <Link
                    href={category.link}
                    onClick={closeMenu}
                    className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
                  >
                    {category.name}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent w-full text-left"
                    >
                      {category.name}
                      <Plus className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col border-b border-transparent bg-black/60 backdrop-blur-md">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.name}
                            href={subcategory.link}
                            className="text-white/70 hover:text-white bg-black/60 backdrop-blur-md text-xs font-medium tracking-wider uppercase transition-colors py-5 pl-4"
                            onClick={closeMenu}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )

  useEffect(() => {
    setMounted(true)
    checkUser()
    loadCategories()
  }, [])

  const menuPortal = mounted
    ? createPortal(
        <>
          <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] opacity-0 pointer-events-none md:hidden supports-[backdrop-filter]:bg-black/60 [-webkit-backdrop-filter:blur(12px)]"
          />

          <div
            ref={sidebarRef}
            className="md:hidden fixed top-0 left-0 h-[100svh] bg-black/60 backdrop-blur-md z-[10000] flex flex-col pointer-events-none w-[35%] max-[900px]:w-full overflow-hidden supports-[backdrop-filter]:bg-black/60 [-webkit-backdrop-filter:blur(12px)]"
            style={{
              transform: "translateX(-100%)",
              willChange: "transform",
            }}
          >
            <div ref={mainFrameRef} className="absolute inset-0 flex flex-col" style={{ transform: "translateX(0%)" }}>
              <div className="flex items-center justify-end p-[1em] border-b border-transparent">
                <button
                  onClick={closeMenu}
                  className="cursor-pointer"
                >
                  <Image src="/close-icon.png" alt="Close" width={16} height={16} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <nav className="flex flex-col p-[1em] overflow-y-auto">
                  <Link
                    href="/new-arrivals"
                    className="text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent"
                    onClick={closeMenu}
                  >
                    NEW IN
                  </Link>

                  <Link
                    href="/best-sellers"
                    className="text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent"
                    onClick={closeMenu}
                  >
                    BEST SELLERS
                  </Link>

                  <button
                    onClick={handleShopAllClick}
                    className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent text-left"
                  >
                    SHOP ALL
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleBrandsClick}
                    className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent text-left"
                  >
                    BRANDS
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleMenClick}
                    className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent text-left"
                  >
                    MEN
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleWomenClick}
                    className="flex items-center justify-between text-white hover:text-white/70 text-sm font-medium tracking-widest uppercase transition-colors py-5 border-b border-transparent text-left"
                  >
                    WOMEN
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>

                <div className="flex flex-col p-[1em] border-t border-transparent">
                  {/* 4 Links */}
                  <div className="flex flex-col gap-3 mb-6">
                    <Link
                      href="/privacy-policy"
                      onClick={closeMenu}
                      className="text-white/70 text-xs hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/request-product"
                      onClick={closeMenu}
                      className="text-white/70 text-xs hover:text-white transition-colors"
                    >
                      Request a Product
                    </Link>
                    <a
                      href="https://www.instagram.com/designerdrip.store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 text-xs hover:text-white transition-colors"
                    >
                      Instagram
                    </a>
                    {user ? (
                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className="text-white/70 text-xs hover:text-white transition-colors"
                      >
                        Account
                      </Link>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={closeMenu}
                        className="text-white/70 text-xs hover:text-white transition-colors"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>

                  {/* Copyright */}
                  <div className="text-white/40 text-[10px] mt-2">
                    © 2026 Saint Yve
                  </div>
                </div>
              </div>
            </div>

            {renderCategoryFrame(shopallFrameRef, shopAllCategories, true)}
            {renderBrandsFrame(brandsFrameRef, brandsCategories)}
            {renderGenderFrame(menFrameRef, menMenuData, "MEN")}
            {renderGenderFrame(womenFrameRef, womenMenuData, "WOMEN")}
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <>
      <button
        onClick={openMenu}
        className="md:hidden cursor-pointer hover:opacity-70 transition-opacity relative z-10"
        aria-label="Open menu"
      >
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="17" height="1.75" fill="black" />
          <rect x="6" y="8.75" width="11" height="1.75" fill="black" />
        </svg>
      </button>

      {menuPortal}
    </>
  )
}
