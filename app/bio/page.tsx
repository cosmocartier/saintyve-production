import Image from "next/image"
import Link from "next/link"

type SocialLink = {
  name: string
  description: string
  url: string
  iconType: "cart" | "image"
  iconSrc?: string
  iconAlt?: string
}

const socialLinks: SocialLink[] = [
  {
    name: "WEBSTORE",
    description: "Shop Our Latest Collection",
    url: "https://designerdrip.store/all",
    iconType: "cart",
  },
  {
    name: "INSTAGRAM",
    description: "Join Our Community",
    url: "https://instagram.com/designerdrip.store",
    iconType: "image",
    iconSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/instagram-icon-white-jfA5o2cbRzYSeHIqo70BVB1geS7ji9.png",
    iconAlt: "Instagram",
  },
  {
    name: "TIKTOK",
    description: "Behind The Scenes",
    url: "https://tiktok.com/@designerdrip.store",
    iconType: "image",
    iconSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiktok-icon-white-xeH0tpAjsZp7ejPWgUYjdGlHeLql80.png",
    iconAlt: "TikTok",
  },
  {
    name: "PINTEREST",
    description: "Style Inspiration",
    url: "https://pinterest.com/designerdripofficial",
    iconType: "image",
    iconSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pinterest-icon-white-8KGDvjpvpXY2BG8aHy7sN1d1UyxRhK.png",
    iconAlt: "Pinterest",
  },
  {
    name: "WHATSAPP",
    description: "Contact Us Directly",
    url: "https://wa.me/971528079266",
    iconType: "image",
    iconSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/whatsapp-icon-white-tk2cXyzEqDtP75SmHjlLzLr3zSaAIM.png",
    iconAlt: "WhatsApp",
  },
]

export default function BioPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Fixed and Full Coverage */}
      <div className="fixed inset-0 w-full h-full">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ysl-hero-mobile-hHakhjakGKAjVNsDksHixfygA6iHvU.webp"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Container - Scrollable */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 md:py-16">
        {/* Logo */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          <img
            src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/9a89d7f1-98e8-4656-c873-01d0a6f90500/logo"
            alt="SAINT YVE"
            className="h-5 md:h-6 w-auto brightness-0 invert"
          />
        </div>

        {/* Tagline */}
        <p className="text-white/90 text-xs md:text-sm uppercase tracking-[0.3em] mb-10 md:mb-14 font-light text-center animate-fade-in">
          Premium Fashion. Elevated Style.
        </p>

        {/* Social Links Grid */}
        <div className="w-full max-w-md space-y-4 animate-fade-in-up">
          {socialLinks.map((link, index) => {
            return (
              <Link
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative overflow-hidden">
                  {/* Backdrop Blur Container */}
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 px-6 py-5 md:px-8 md:py-6 transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          {link.iconType === "cart" ? (
                            <Image
                              src="/icons/shoppingbag.png"
                              alt="Webstore"
                              width={20}
                              height={20}
                              className="brightness-0 invert w-5 h-5 md:w-6 md:h-6 object-contain"
                            />
                          ) : (
                            <Image
                              src={link.iconSrc!}
                              alt={link.iconAlt!}
                              width={24}
                              height={24}
                              className="w-5 h-5 md:w-6 md:h-6 object-contain"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm md:text-base uppercase tracking-[0.15em] mb-1">
                            {link.name}
                          </h3>
                          <p className="text-white/70 text-xs tracking-wide">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer Text */}
        <div className="mt-12 md:mt-16 text-center animate-fade-in">
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.2em] font-light">
            Est. 2022 — Curated in Germany
          </p>
        </div>
      </div>
    </div>
  )
}
