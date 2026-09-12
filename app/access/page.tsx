import type { Metadata } from "next"
import { AccessPageClient } from "@/components/access/access-page-client"

export const metadata: Metadata = {
  title: "Private Access — SAINT YVE",
  description:
    "Saint Yve operates as a private sourcing platform. Inventory is shared exclusively via our private line.",
  robots: { index: false, follow: false },
}

export default function AccessPage() {
  return <AccessPageClient />
}
