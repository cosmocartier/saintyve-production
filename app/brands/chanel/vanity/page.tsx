import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Chanel Vanity | Saint Yve",
  description: "Discover the Chanel Vanity collection at Saint Yve.",
}

export default async function ChanelVanityPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Vanity"
      basePath="/brands/chanel/vanity"
      storageKeyPrefix="chanelVanity"
      modelPattern="\mvanity\M"
      breadcrumbs={[
        { name: "Chanel", path: "/brands/chanel" },
        { name: "Vanity", path: "/brands/chanel/vanity" },
      ]}
    />
  )
}
