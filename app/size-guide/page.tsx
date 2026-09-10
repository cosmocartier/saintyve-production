import type { Metadata } from "next"
import SizeGuideClientPage from "@/app/size-guide/client-page"

export const metadata: Metadata = {
  title: "Size Guide | Designerdrip",
  description: "Designerdrip size guide for sneakers, jackets, vests, jewelry, and more.",
}

export default function SizeGuidePage() {
  return <SizeGuideClientPage />
}
