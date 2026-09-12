import type { Metadata } from "next"
import { CareGuideClientPage } from "@/app/care-guide/client-page"

export const metadata: Metadata = {
  title: "Care Guide | Saint Yve",
  description:
    "How to clean, store, and care for Saint Yve pieces — sneakers, jackets, bags, jewelry, watches, and more.",
}

export default function CareGuidePage() {
  return <CareGuideClientPage />
}
