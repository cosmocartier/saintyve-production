import type { Metadata } from "next"
import { CareGuideClientPage } from "@/app/care-guide/client-page"

export const metadata: Metadata = {
  title: "Care Guide | Designerdrip",
  description:
    "How to clean, store, and care for Designerdrip pieces — sneakers, jackets, bags, jewelry, watches, and more.",
}

export default function CareGuidePage() {
  return <CareGuideClientPage />
}
