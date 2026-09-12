import type { Metadata } from "next"
import SizeGuideClientPage from "@/app/size-guide/client-page"

export const metadata: Metadata = {
  title: "Size Guide | Saint Yve",
  description: "Saint Yve size guide for sneakers, jackets, vests, jewelry, and more.",
}

export default function SizeGuidePage() {
  return <SizeGuideClientPage />
}
