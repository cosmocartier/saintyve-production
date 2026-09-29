import type { Metadata } from "next"
import { StaticNavigation } from "@/components/static-navigation"
import { Footer } from "@/components/footer"
import { AuthenticityContent } from "@/components/authenticity-content"

export const metadata: Metadata = {
  title: "Authenticity | SAINT YVE",
  description:
    "Discover the SAINT YVE approach to authenticity and learn about the third-party authentication certificate accompanying every CHANEL and HERMÈS handbag.",
  alternates: {
    canonical: "/authenticity",
  },
}

export default function AuthenticityPage() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavigation />
      <AuthenticityContent />
      <Footer />
    </div>
  )
}
