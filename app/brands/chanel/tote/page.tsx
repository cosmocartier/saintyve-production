import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Chanel Tote | Saint Yve",
  description: "Discover the Chanel Tote collection at Saint Yve.",
}

export default async function ChanelTotePage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Tote"
      basePath="/brands/chanel/tote"
      storageKeyPrefix="chanelTote"
      modelPattern="\mtote\M"
      breadcrumbs={[
        { name: "Chanel", path: "/brands/chanel" },
        { name: "Tote", path: "/brands/chanel/tote" },
      ]}
    />
  )
}
