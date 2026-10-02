import type { Metadata } from "next"
import {
  BrandCollectionPage,
  type BrandPageSearchParams,
} from "@/components/category-pages/brand-collection/brand-collection-page"

export const metadata: Metadata = {
  title: "Maxi Flap Bags | Saint Yve",
  description: "Discover the Chanel Maxi Flap Bag collection at Saint Yve.",
}

export default async function ChanelFlapBagsPage({ searchParams }: { searchParams: Promise<BrandPageSearchParams> }) {
  return (
    <BrandCollectionPage
      searchParams={await searchParams}
      brands={["Chanel"]}
      brandLabel="Chanel"
      pageTitle="Maxi Flap Bags"
      basePath="/brands/chanel/flap-bags"
      storageKeyPrefix="chanelFlapBags"
      modelPattern="flap bag"
      breadcrumbs={[
        { name: "Chanel", path: "/brands/chanel" },
        { name: "Maxi Flap Bags", path: "/brands/chanel/flap-bags" },
      ]}
    />
  )
}
