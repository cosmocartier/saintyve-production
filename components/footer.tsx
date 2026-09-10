interface FooterSection {
  title: string
  links: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

const footerSections: FooterSection[] = [
  {
    title: "COLLECTIONS",
    links: [
      { label: "Sneakers", href: "/sneakers" },
      { label: "Bags", href: "/bags" },
      { label: "Jackets", href: "/jackets" },
      { label: "Vests", href: "/vests" },
      { label: "Watches", href: "/watches" },
      { label: "Jewelry", href: "/jewelry" },
      { label: "Accessories", href: "/accessories" },
    ],
  },
  {
    title: "ICONIC BRANDS",
    links: [
      { label: "Nike Nocta", href: "/brands/nike-nocta" },
      { label: "Chrome Hearts", href: "/brands/chrome-hearts" },
      { label: "Chanel", href: "/brands/chanel" },
      { label: "Jordan", href: "/brands/air-jordan" },
      { label: "Cartier", href: "/brands/cartier" },
      { label: "Moncler", href: "/brands/moncler" },
    ],
  },
  {
    title: "CONTACT US",
    links: [
      { label: "Customer Service", href: "/contact-us" },
      { label: "Email Us", href: "mailto:support@designerdrip.store", external: true },
      { label: "WhatsApp", href: "https://wa.me/971528079266", external: true },
    ],
  },
  {
    title: "SERVICES",
    links: [
      { label: "Shipping & Delivery", href: "/shipping-policy" },
      { label: "Returns & Exchanges", href: "/return-policy" },
      { label: "Frequently Asked Questions", href: "/faq" },
    ],
  },
  {
    title: "CORPORATE",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Our Mission", href: "/mission" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "SOCIALS",
    links: [],
  },
]

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="lg:hidden">
        {footerSections.map((section) => (
          <div key={section.title} className="border-b border-white/10 px-6 py-6">
            <h3 className="text-[13px] font-light tracking-wide mb-6">{section.title}</h3>
            {section.title === "SOCIALS" ? (
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/designerdrip.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/c30220ff-870e-47ae-5904-8e30023e3f00/socialicons"
                    alt="Instagram"
                    className="h-6 w-6"
                  />
                </a>
                <a
                  href="https://pinterest.com/designerdripofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/d47e8fe7-620e-4e30-33cd-614d20370400/socialicons"
                    alt="Pinterest"
                    className="h-6 w-6"
                  />
                </a>
                <a
                  href="https://www.tiktok.com/@designerdrip.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/dfea4de2-9928-49f9-3499-fea028325400/socialicons"
                    alt="TikTok"
                    className="h-6 w-6"
                  />
                </a>
              </div>
            ) : (
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] font-light text-white/70 hover:text-white transition-colors block"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="hidden lg:block px-12 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-6 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[13px] font-light tracking-wide mb-6">{section.title}</h3>
              {section.title === "SOCIALS" ? (
                <div className="flex items-center gap-4">
                  <a
                    href="https://instagram.com/designerdrip.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/c30220ff-870e-47ae-5904-8e30023e3f00/socialicons"
                      alt="Instagram"
                      className="h-6 w-6"
                    />
                  </a>
                  <a
                    href="https://pinterest.com/designerdripofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/dfea4de2-9928-49f9-3499-fea028325400/socialicons"
                      alt="Pinterest"
                      className="h-6 w-6"
                    />
                  </a>
                  <a
                    href="https://www.tiktok.com/@designerdrip.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src="https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/dfea4de2-9928-49f9-3499-fea028325400/socialicons"
                      alt="TikTok"
                      className="h-6 w-6"
                    />
                  </a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] font-light text-white/70 hover:text-white transition-colors"
                        {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Static legal section */}
      <div className="border-t border-white/10 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a
                href="/privacy-policy"
                className="text-[11px] font-light text-white/60 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-[11px] font-light text-white/60 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/cookie-policy"
                className="text-[11px] font-light text-white/60 hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
            <p className="text-[11px] font-light text-white/60">© 2025 DESIGNERDRIP, INC. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
