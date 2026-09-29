// Footer navigation links.
// To activate a link, add an `href` (e.g. "/stockists", "/contact", "/legal").
// Items without an `href` render as static (non-clickable) text.
interface FooterNavItem {
  label: string
  href?: string
}

const footerNavItems: FooterNavItem[] = [
  { label: "Stores", href: "/stores" },
  { label: "Contact" },
  { label: "Legal" },
]

function FooterNavLink({ label, href }: FooterNavItem) {
  const className = "text-xl font-bold uppercase tracking-tight text-white hover:text-white/70 transition-colors"

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }

  return <span className={className}>{label}</span>
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      {/* Mobile */}
      <div className="lg:hidden flex flex-col items-center gap-10 px-6 py-20">
        <nav className="flex flex-col items-center gap-1">
          {footerNavItems.map((item) => (
            <FooterNavLink key={item.label} {...item} />
          ))}
        </nav>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-medium uppercase tracking-tight text-white">
            Saint Yve &copy; {year}
          </p>
          <p className="text-xs font-medium uppercase tracking-tight text-white">
            Authentic Pre-Owned Luxury
          </p>
          <p className="text-xs leading-relaxed text-white/50 max-w-[260px]">
            Every Chanel and Hermès piece is carefully authenticated before being offered by Saint Yve.
          </p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between px-12 py-10">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-tight text-white">
            Saint Yve &copy; {year}
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-tight text-white">
              Authentic Pre-Owned Luxury
            </p>
            <p className="text-xs leading-relaxed text-white/50 max-w-sm">
              Every Chanel and Hermès piece is carefully authenticated before being offered by Saint Yve.
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-10">
          {footerNavItems.map((item) => (
            <FooterNavLink key={item.label} {...item} />
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
